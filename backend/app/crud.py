# app/crud.py - VERSÃO COMPLETA ATUALIZADA COM AUTO-APRENDIZAGEM
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional, List, Dict, Any
import json
from datetime import datetime, date
from zoneinfo import ZoneInfo
import logging # 🔹 NOVO: Import para logging

# Configuração do logging
logger = logging.getLogger(__name__) # 🔹 NOVO: Inicialização do logger

# --- Imports Explícitos ---
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.models.usuario import Usuario
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import (
    RefeicaoSalvaCreate,
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema
)

# 🔹 NOVO: Import para auto-aprendizagem
from app.vision import fetch_gemini_nutritional_data

# --- FUNÇÕES AUXILIARES PARA AUTO-APRENDIZAGEM ---

def normalizar_nome_alimento(nome: str) -> str:
    """
    Normaliza o nome do alimento para comparações simples.
    Remove acentos, espaços extras e converte para minúsculas.

    Exemplos:
      "Pão de Hambúrguer" -> "pao de hamburguer"
      "Arroz Branco Cozido" -> "arroz branco cozido"
    """
    if not nome:
        return ""

    # Remove acentos simples (você pode usar uma lib como unidecode para mais robustez)
    nome = nome.strip().lower()
    # Remove caracteres especiais comuns, mantendo letras, números e espaços
    nome = ' '.join(nome.split())  # Remove espaços múltiplos
    return nome

def get_or_create_alimento_by_nome(db: Session, nome: str) -> Optional[Alimento]:
    """
    Tenta encontrar um alimento na tabela 'alimentos' pelo nome normalizado.
    Se não encontrar, chama o Gemini para gerar dados nutricionais e cria um novo registro.

    Args:
        db: Sessão do SQLAlchemy
        nome: Nome do alimento detectado pela IA (ex: "pão de hambúrguer")

    Returns:
        Objeto Alimento (já persistido) ou None em caso de erro
    """
    if not nome:
        return None

    nome_normalizado = normalizar_nome_alimento(nome)
    logger.info(f"🔍 Procurando alimento: '{nome}' (normalizado: '{nome_normalizado}')")

    # 1️⃣ Tenta achar na tabela alimentos (TACO + já criados pela IA)
    # Busca por alimento_normalizado OU alimento (para compatibilidade com TACO)
    alimento_existente = db.query(Alimento).filter(
        func.lower(Alimento.alimento_normalizado) == nome_normalizado
    ).first()

    if not alimento_existente:
        # Tenta busca mais ampla por similaridade no campo 'alimento'
        # Usando func.lower para garantir case-insensitivity na busca
        alimento_existente = db.query(Alimento).filter(
            func.lower(Alimento.alimento).contains(nome_normalizado)
        ).order_by(func.similarity(Alimento.alimento, nome_normalizado).desc()).first() # Necessita extensão pg_trgm no PostgreSQL

    if alimento_existente:
        logger.info(f"✅ Alimento encontrado na base: '{alimento_existente.alimento}' (ID: {alimento_existente.id})")
        return alimento_existente

    # 2️⃣ Não achou → chama Gemini para estimar os dados nutricionais
    logger.info(f"🔄 Alimento não encontrado. Consultando Gemini para: '{nome}'")
    dados_ia = fetch_gemini_nutritional_data(nome)

    if "erro" in dados_ia:
        logger.error(f"❌ Erro ao obter dados do Gemini para '{nome}': {dados_ia.get('erro')}")
        return None

    # 3️⃣ Monta novo Alimento a partir da resposta do Gemini
    # Garantimos defaults com .get para evitar KeyError
    try:
        novo_alimento = Alimento(
            # Identificação
            categoria=dados_ia.get("categoria", "Outros"),  # Pode ser inferido depois
            alimento_normalizado=nome_normalizado,
            alimentos=nome,  # Nome original detectado
            alimento=dados_ia.get("alimento", nome),

            # Macronutrientes (por 100g)
            energia_kcal_100g=float(dados_ia.get("energia_kcal_100g", 0) or 0),
            proteina_g_100g=float(dados_ia.get("proteina_g_100g", 0) or 0),
            carboidrato_g_100g=float(dados_ia.get("carboidrato_g_100g", 0) or 0),
            lipidios_g_100g=float(dados_ia.get("lipidios_g_100g", 0) or 0),
            fibra_g_100g=float(dados_ia.get("fibra_g_100g", 0) or 0),

            # Detalhes de gorduras (por enquanto, Gemini não retorna - deixar 0)
            ac_graxos_saturados_g=float(dados_ia.get("ac_graxos_saturados_g", 0) or 0),
            ac_graxos_monoinsaturados_g=float(dados_ia.get("ac_graxos_monoinsaturados_g", 0) or 0),
            ac_graxos_poliinsaturados_g=float(dados_ia.get("ac_graxos_poliinsaturados_g", 0) or 0),
            colesterol_mg_100g=float(dados_ia.get("colesterol_mg_100g", 0) or 0),

            # Micronutrientes (por enquanto, Gemini não retorna - deixar 0)
            # ⚠️ FUTURO: Expandir o prompt do Gemini para incluir esses campos
            sodio_mg_100g=float(dados_ia.get("sodio_mg_100g", 0) or 0),
            potassio_mg_100g=float(dados_ia.get("potassio_mg_100g", 0) or 0),
            calcio_mg_100g=float(dados_ia.get("calcio_mg_100g", 0) or 0),
            ferro_mg_100g=float(dados_ia.get("ferro_mg_100g", 0) or 0),
            magnesio_mg_100g=float(dados_ia.get("magnesio_mg_100g", 0) or 0),

            # Medidas caseiras
            unidades=float(dados_ia.get("unidades", 1) or 1),
            un_medida_caseira=dados_ia.get("un_medida_caseira", None),
            peso_aproximado_g=float(dados_ia.get("peso_aproximado_g", 100) or 100),
        )

        # 4️⃣ Salva no banco
        db.add(novo_alimento)
        db.commit()
        db.refresh(novo_alimento)

        logger.info(f"✅ Novo alimento criado e salvo: '{nome}' (ID: {novo_alimento.id})")
        logger.info(f"   📊 Dados: {novo_alimento.energia_kcal_100g} kcal/100g, "
                   f"{novo_alimento.proteina_g_100g}g prot, "
                   f"{novo_alimento.carboidrato_g_100g}g carbs")

        return novo_alimento

    except Exception as e:
        logger.error(f"❌ Erro ao criar novo alimento '{nome}': {e}")
        db.rollback()
        return None

# --- CRUD para Refeição Salva (VERSÃO ATUALIZADA) ---

def create_refeicao_salva(db: Session,
                         refeicao_data: RefeicaoSalvaCreate,
                         user_id: int) -> RefeicaoSalva:
    """
    Cria uma nova refeição salva com seus alimentos,
    vinculando cada alimento à tabela 'alimentos' (TACO + IA auto-aprendizagem).

    Fluxo para cada alimento:
    1. Procura na tabela 'alimentos' (TACO + já criados)
    2. Se não achar, chama Gemini → cria novo registro em 'alimentos'
    3. Salva AlimentoSalvo com alimento_id preenchido
    """
    logger.info(f"🛠️ Criando refeição salva para user_id {user_id} com {len(refeicao_data.alimentos)} alimentos")

    # 1️⃣ Cria a refeição base
    db_refeicao = RefeicaoSalva(
        owner_id=user_id,
        status=RefeicaoStatus.PENDING_ANALYSIS,
        imagem_url=refeicao_data.imagem_url
    )

    db.add(db_refeicao)
    db.flush()  # Gera o ID da refeição antes de inserir alimentos

    # 2️⃣ Processa cada alimento detectado
    alimentos_processados = []
    for i, alimento_data in enumerate(refeicao_data.alimentos):
        try:
            # Pega os dados do Pydantic (v2 ou v1)
            if hasattr(alimento_data, 'model_dump'):
                payload = alimento_data.model_dump()
            else:
                payload = alimento_data.dict()

            nome_alimento = payload.get("nome", "")
            logger.info(f"  📋 Processando alimento {i+1}: '{nome_alimento}'")

            # 3️⃣ Tenta encontrar/criar o alimento na tabela 'alimentos'
            alimento_registro = get_or_create_alimento_by_nome(db, nome_alimento)
            alimento_id = alimento_registro.id if alimento_registro else None

            if not alimento_id:
                logger.warning(f"  ⚠️ Não foi possível obter dados para '{nome_alimento}'. Salvando sem vínculo.")
            else:
                logger.info(f"  ✅ Alimento vinculado (ID: {alimento_id})")

            # 4️⃣ Cria o AlimentoSalvo já amarrado ao alimento_id
            db_alimento_salvo = AlimentoSalvo(
                **payload,
                refeicao_id=db_refeicao.id,
                alimento_id=alimento_id  # 🔹 NOVO: Preenche o vínculo
            )

            db.add(db_alimento_salvo)
            alimentos_processados.append({
                "nome": nome_alimento,
                "alimento_id": alimento_id,
                "quantidade_g": payload.get("quantidade_estimada_g")
            })

        except Exception as e:
            logger.error(f"❌ Erro ao processar alimento '{nome_alimento}': {e}")
            # Continua processando os outros alimentos mesmo se um falhar

    # 5️⃣ Finaliza a transação
    try:
        db.commit()
        db.refresh(db_refeicao)

        logger.info(f"✅ Refeição salva criada (ID: {db_refeicao.id}) com {len(alimentos_processados)} alimentos processados")
        for alimento in alimentos_processados:
            status = "vinculado" if alimento["alimento_id"] else "sem vínculo"
            logger.info(f"   - {alimento['nome']}: {status} (ID: {alimento['alimento_id']})")

        return db_refeicao

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao salvar refeição: {e}")
        raise

# --- FUNÇÕES EXISTENTES (mantidas sem alteração) ---

def get_refeicao_salva(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    """Busca uma refeição salva pelo ID, garantindo que pertence ao usuário."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == user_id
    ).first()

def update_refeicao_status(db: Session, db_refeicao: RefeicaoSalva, status: RefeicaoStatus) -> RefeicaoSalva:
    """Atualiza o status de uma refeição salva."""
    db_refeicao.status = status
    db_refeicao.updated_at = datetime.now()
    db.commit()
    db.refresh(db_refeicao)
    return db_refeicao

def get_historico_refeicoes_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    """Busca todas as refeições de um usuário para a lista de histórico."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id
    ).order_by(RefeicaoSalva.created_at.desc()).all()

def get_detalhe_refeicao_por_id(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    """Busca uma refeição específica e garante que ela pertence ao usuário."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == user_id
    ).first()

def get_consumo_macros_hoje(db: Session, user_id: int) -> dict:
    """Soma o total de calorias, proteínas, carboidratos e gorduras de todas as refeições de hoje."""
    hoje = date.today()

    refeicoes_hoje = (
        db.query(RefeicaoSalva)
        .filter(
            RefeicaoSalva.owner_id == user_id,
            func.date(RefeicaoSalva.created_at) == hoje
        )
        .all()
    )

    total_calorias = 0.0
    total_proteinas_g = 0.0
    total_carboidratos_g = 0.0
    total_gorduras_g = 0.0

    for refeicao in refeicoes_hoje:
        if refeicao.analysis_result_json:
            try:
                analise = json.loads(refeicao.analysis_result_json)

                analise_nutricional = analise.get("analise_nutricional", {})
                macros = analise_nutricional.get("macronutrientes", {})

                total_calorias += analise_nutricional.get("calorias_totais", 0)
                total_proteinas_g += macros.get("proteinas_g", 0)
                total_carboidratos_g += macros.get("carboidratos_g", 0)
                total_gorduras_g += macros.get("gorduras_g", 0)

            except Exception as e:
                print(f"Erro ao processar JSON da refeição ID {refeicao.id}: {e}")

    return {
        "total_calorias": round(total_calorias, 1),
        "total_proteinas_g": round(total_proteinas_g, 1),
        "total_carboidratos_g": round(total_carboidratos_g, 1),
        "total_gorduras_g": round(total_gorduras_g, 1)
    }

def get_refeicoes_hoje_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    """
    Busca todas as refeições do usuário de hoje
    que já tiveram a análise concluída.
    """
    today = datetime.now(ZoneInfo('America/Sao_Paulo')).date()

    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id,
        cast(RefeicaoSalva.created_at, Date) == today,
        RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE
    ).order_by(RefeicaoSalva.created_at.asc()).all()

def enriquecer_refeicao_com_analise(refeicao: RefeicaoSalva) -> dict:
    """
    Extrai dados da análise JSON e dos alimentos salvos
    para enriquecer a resposta do dashboard.

    🔹 NOVO: Se tiver alimento_id, pode acessar dados mais precisos da tabela 'alimentos'
    """
    resultado = {
        "id": refeicao.id,
        "tipo": None,
        "kcal_estimadas": None,
        "imagem_url": refeicao.imagem_url,
        "proteinas_g": None,
        "carboidratos_g": None,
        "gorduras_g": None,
        "suggested_name": None,
        "alimentos_principais": [],
        # 🔹 NOVO: Informações sobre vínculo com tabela alimentos
        "alimentos_vinculados": 0,
        "alimentos_sem_vinculo": 0
    }

    # 1️⃣ Extrair dados da análise JSON (se existir) - MANTIDO
    if refeicao.analysis_result_json:
        try:
            analise = json.loads(refeicao.analysis_result_json)

            # Extrair calorias
            analise_nutricional = analise.get("analise_nutricional", {})
            resultado["kcal_estimadas"] = analise_nutricional.get("calorias_totais")

            # Extrair macros
            macros = analise_nutricional.get("macronutrientes", {})
            resultado["proteinas_g"] = macros.get("proteinas_g")
            resultado["carboidratos_g"] = macros.get("carboidratos_g")
            resultado["gorduras_g"] = macros.get("gorduras_g")

        except Exception as e:
            print(f"Erro ao processar JSON da refeição ID {refeicao.id}: {e}")

    # 2️⃣ Extrair lista de alimentos principais E contar vínculos - ATUALIZADO
    if refeicao.alimentos:
        alimentos_vinculados = 0
        alimentos_sem_vinculo = 0

        # Pega os 3 primeiros alimentos para o nome sugerido
        alimentos_principais = []
        for alimento in refeicao.alimentos[:3]:
            alimentos_principais.append(alimento.nome)

            # Conta vínculos com tabela alimentos
            if alimento.alimento_id:
                alimentos_vinculados += 1
            else:
                alimentos_sem_vinculo += 1

        resultado["alimentos_principais"] = alimentos_principais
        resultado["alimentos_vinculados"] = alimentos_vinculados
        resultado["alimentos_sem_vinculo"] = alimentos_sem_vinculo

        # Gera um nome sugerido baseado nos alimentos
        if len(alimentos_principais) > 0:
            if len(alimentos_principais) == 1:
                resultado["suggested_name"] = alimentos_principais[0]
            elif len(alimentos_principais) == 2:
                resultado["suggested_name"] = f"{alimentos_principais[0]} e {alimentos_principais[1]}"
            else:
                resultado["suggested_name"] = f"{alimentos_principais[0]}, {alimentos_principais[1]} e mais"

    # 3️⃣ Inferir tipo de refeição baseado no horário - MANTIDO
    hora_criacao = refeicao.created_at.hour
    if 5 <= hora_criacao < 11:
        resultado["tipo"] = "Café da Manhã"
    elif 11 <= hora_criacao < 15:
        resultado["tipo"] = "Almoço"
    elif 15 <= hora_criacao < 18:
        resultado["tipo"] = "Lanche da Tarde"
    elif 18 <= hora_criacao < 23:
        resultado["tipo"] = "Jantar"
    else:
        resultado["tipo"] = "Lanche da Madrugada"

    return resultado
