# app/crud.py - VERSÃO FINAL E CONSOLIDADA
"""
CRUD operations for the nutrition tracking application
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, text
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, List, Dict, Any
import json
from datetime import datetime, date
from zoneinfo import ZoneInfo
import logging # 🔹 NOVO: Import para logging

# Configuração do logging
logger = logging.getLogger(__name__) # 🔹 NOVO: Inicialização do logger

# Imports explícitos
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.models.usuario import Usuario
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import (
    RefeicaoSalvaCreate,
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema,
    AlimentoSalvaCreate # 🔹 NOVO: Import para o tipo de alimento na criação
)

# 🔹 NOVO: Import para auto-aprendizagem (Gemini)
from app.vision import fetch_gemini_nutritional_data

# --- CONFIGURAÇÕES ---
# Configuração do fuso horário para Brasil
BRAZIL_TIMEZONE = ZoneInfo('America/Sao_Paulo')

# --- FUNÇÕES AUXILIARES PARA AUTO-APRENDIZAGEM ---
def normalizar_nome_alimento(nome: str) -> str:
    """
    Normaliza o nome do alimento para comparações simples.
    Remove acentos, espaços extras e converte para minúsculas.
    """
    if not nome:
        return ""
    nome = nome.strip().lower()
    # Remove caracteres especiais comuns, mantendo letras, números e espaços
    nome = ' '.join(nome.split())  # Remove espaços múltiplos
    return nome

def get_or_create_alimento_by_nome(db: Session, nome: str) -> Optional[Alimento]:
    """
    Tenta encontrar um alimento na tabela 'alimentos' pelo nome normalizado.
    Se não encontrar, chama o Gemini para gerar dados nutricionais e cria um novo registro.
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
        # Tenta busca mais ampla por similaridade no campo 'alimento' usando pg_trgm
        # ORDENAÇÃO POR SIMILARIDADE (requer pg_trgm ativado no banco)
        alimento_existente = db.query(Alimento).filter(
            func.lower(Alimento.alimento).contains(nome_normalizado) # Filtra antes de ordenar
        ).order_by(func.similarity(Alimento.alimento, nome_normalizado).desc()).first()

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
    try:
        novo_alimento = Alimento(
            categoria=dados_ia.get("categoria", "Desconhecida"),
            alimento_normalizado=normalizar_nome_alimento(dados_ia.get("alimento", nome)),
            alimentos=dados_ia.get("alimento", nome), # Nome completo
            alimento=dados_ia.get("alimento", nome), # Nome mais genérico
            energia_kcal_100g=float(dados_ia.get("energia_kcal_100g", 0) or 0),
            proteina_g_100g=float(dados_ia.get("proteina_g_100g", 0) or 0),
            carboidrato_g_100g=float(dados_ia.get("carboidrato_g_100g", 0) or 0),
            lipidios_g_100g=float(dados_ia.get("lipidios_g_100g", 0) or 0),
            fibra_g_100g=float(dados_ia.get("fibra_g_100g", 0) or 0),
            ac_graxos_saturados_g=float(dados_ia.get("ac_graxos_saturados_g", 0) or 0),
            ac_graxos_monoinsaturados_g=float(dados_ia.get("ac_graxos_monoinsaturados_g", 0) or 0),
            ac_graxos_poliinsaturados_g=float(dados_ia.get("ac_graxos_poliinsaturados_g", 0) or 0),
            colesterol_mg_100g=float(dados_ia.get("colesterol_mg_100g", 0) or 0),
            sodio_mg_100g=float(dados_ia.get("sodio_mg_100g", 0) or 0),
            potassio_mg_100g=float(dados_ia.get("potassio_mg_100g", 0) or 0),
            calcio_mg_100g=float(dados_ia.get("calcio_mg_100g", 0) or 0),
            ferro_mg_100g=float(dados_ia.get("ferro_mg_100g", 0) or 0),
            magnesio_mg_100g=float(dados_ia.get("magnesio_mg_100g", 0) or 0),
            unidades=float(dados_ia.get("unidades", 1) or 1),
            un_medida_caseira=dados_ia.get("un_medida_caseira", "unidade"),
            peso_aproximado_g=float(dados_ia.get("peso_aproximado_g", 100) or 100),
        )

        db.add(novo_alimento)
        db.commit()
        db.refresh(novo_alimento)

        logger.info(f"✅ Novo alimento criado e salvo: '{nome}' (ID: {novo_alimento.id})")
        return novo_alimento

    except Exception as e:
        logger.error(f"❌ Erro ao criar novo alimento '{nome}': {e}")
        db.rollback()
        return None

# --- OPERAÇÕES CRUD ---

def create_refeicao_salva(
    db: Session,
    refeicao_data: RefeicaoSalvaCreate,
    user_id: int
) -> RefeicaoSalva:
    """
    Cria uma nova refeição salva com seus alimentos, vinculando-os à tabela 'alimentos'.
    """
    try:
        db_refeicao = RefeicaoSalva(
            owner_id=user_id,
            status=RefeicaoStatus.PENDING_ANALYSIS,
            imagem_url=refeicao_data.imagem_url
        )
        db.add(db_refeicao)
        db.flush()  # Gera o ID antes de inserir os alimentos

        for alimento_data in refeicao_data.alimentos:
            # 🔹 NOVO: Obter ou criar o alimento na tabela 'alimentos'
            alimento_detalhes = get_or_create_alimento_by_nome(db, alimento_data.nome)

            alimento_dict = alimento_data.model_dump(exclude_unset=True)

            # 🔹 CORREÇÃO: Remover conversão int() se o schema AlimentoSalvo espera float
            # Assumindo que AlimentoSalvo.calorias_estimadas é float, não precisa de int()
            # if 'calorias_estimadas' in alimento_dict:
            #     alimento_dict['calorias_estimadas'] = int(alimento_dict['calorias_estimadas'])

            db_alimento = AlimentoSalvo(
                **alimento_dict,
                refeicao_id=db_refeicao.id,
                alimento_id=alimento_detalhes.id if alimento_detalhes else None # Vincula o ID
            )
            db.add(db_alimento)

        db.commit()
        db.refresh(db_refeicao)
        logger.info(f"✅ Refeição ID {db_refeicao.id} criada com sucesso para user {user_id}")
        return db_refeicao

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"❌ Erro ao salvar refeição para user {user_id}: {str(e)}")
        raise Exception(f"Erro ao salvar refeição: {str(e)}")

def get_refeicao_salva(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    """Busca uma refeição salva pelo ID, garantindo que pertence ao usuário."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == user_id
    ).first()

def update_refeicao_status(db: Session, db_refeicao: RefeicaoSalva, status: RefeicaoStatus) -> RefeicaoSalva:
    """Atualiza o status de uma refeição salva."""
    try:
        db_refeicao.status = status
        db_refeicao.updated_at = datetime.now(BRAZIL_TIMEZONE)
        db.commit()
        db.refresh(db_refeicao)
        logger.info(f"✅ Status da refeição ID {db_refeicao.id} atualizado para {status}")
        return db_refeicao
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"❌ Erro ao atualizar status da refeição ID {db_refeicao.id}: {str(e)}")
        raise Exception(f"Erro ao atualizar status da refeição: {str(e)}")

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
    """
    Soma o total de calorias, proteínas, carboidratos e gorduras de todas as refeições de hoje.
    """
    try:
        hoje = date.today()

        refeicoes_hoje = db.query(RefeicaoSalva).filter(
            RefeicaoSalva.owner_id == user_id,
            func.date(RefeicaoSalva.created_at) == hoje,
            RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE # Apenas refeições concluídas
        ).all()

        total_calorias = 0.0
        total_proteinas_g = 0.0
        total_carboidratos_g = 0.0
        total_gorduras_g = 0.0

        for refeicao in refeicoes_hoje:
            # 🔹 NOVO: Usar dados da tabela 'alimentos' se disponível
            for alimento_salvo in refeicao.alimentos:
                if alimento_salvo.alimento_detalhes and alimento_salvo.quantidade_estimada_g:
                    # Calcula a proporção da porção em relação a 100g
                    proporcao = alimento_salvo.quantidade_estimada_g / 100.0
                    detalhes = alimento_salvo.alimento_detalhes

                    total_calorias += (detalhes.energia_kcal_100g or 0) * proporcao
                    total_proteinas_g += (detalhes.proteina_g_100g or 0) * proporcao
                    total_carboidratos_g += (detalhes.carboidrato_g_100g or 0) * proporcao
                    total_gorduras_g += (detalhes.lipidios_g_100g or 0) * proporcao
                elif refeicao.analysis_result_json: # Fallback para JSON se não tiver alimento_detalhes
                    try:
                        analise = json.loads(refeicao.analysis_result_json)
                        analise_nutricional = analise.get("analise_nutricional", {})
                        macros = analise_nutricional.get("macronutrientes", {})

                        total_calorias += float(analise_nutricional.get("calorias_totais", 0))
                        total_proteinas_g += float(macros.get("proteinas_g", 0))
                        total_carboidratos_g += float(macros.get("carboidratos_g", 0))
                        total_gorduras_g += float(macros.get("gorduras_g", 0))

                    except (json.JSONDecodeError, KeyError, ValueError) as e:
                        logger.warning(f"Erro ao processar JSON da refeição ID {refeicao.id} (fallback): {e}")
                        continue

        resultado = {
            "total_calorias": round(total_calorias, 1),
            "total_proteinas_g": round(total_proteinas_g, 1),
            "total_carboidratos_g": round(total_carboidratos_g, 1),
            "total_gorduras_g": round(total_gorduras_g, 1)
        }
        logger.info(f"✅ Resumo de macros para user {user_id} calculado: {resultado}")
        return resultado

    except SQLAlchemyError as e:
        logger.error(f"❌ Erro ao buscar consumo macros para user {user_id}: {str(e)}")
        return {
            "total_calorias": 0.0,
            "total_proteinas_g": 0.0,
            "total_carboidratos_g": 0.0,
            "total_gorduras_g": 0.0
        }

def get_refeicoes_hoje_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    """
    Busca todas as refeições do usuário de hoje que já tiveram a análise concluída.
    """
    try:
        today = datetime.now(BRAZIL_TIMEZONE).date()
        return db.query(RefeicaoSalva).filter(
            RefeicaoSalva.owner_id == user_id,
            cast(RefeicaoSalva.created_at, Date) == today,
            RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE
        ).order_by(RefeicaoSalva.created_at.asc()).all()
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro ao buscar refeições de hoje para user {user_id}: {str(e)}")
        return []

def enriquecer_refeicao_com_analise(refeicao: RefeicaoSalva) -> Dict[str, Any]:
    """
    Enriquece os dados de uma RefeicaoSalva com informações da análise JSON,
    calculando totais e inferindo o tipo de refeição.
    """
    resultado: Dict[str, Any] = {
        "id": refeicao.id,
        "kcal_estimadas": 0.0,
        "imagem_url": refeicao.imagem_url,
        "proteinas_g": 0.0,
        "carboidratos_g": 0.0,
        "gorduras_g": 0.0,
        "suggested_name": "Refeição",
        "alimentos_principais": []
    }

    # 1️⃣ Extrair dados da análise JSON ou da tabela 'alimentos'
    total_kcal_refeicao = 0.0
    total_proteinas_refeicao = 0.0
    total_carboidratos_refeicao = 0.0
    total_gorduras_refeicao = 0.0
    alimentos_principais = []

    for alimento_salvo in refeicao.alimentos:
        if alimento_salvo.alimento_detalhes and alimento_salvo.quantidade_estimada_g:
            proporcao = alimento_salvo.quantidade_estimada_g / 100.0
            detalhes = alimento_salvo.alimento_detalhes

            total_kcal_refeicao += (detalhes.energia_kcal_100g or 0) * proporcao
            total_proteinas_refeicao += (detalhes.proteina_g_100g or 0) * proporcao
            total_carboidratos_refeicao += (detalhes.carboidrato_g_100g or 0) * proporcao
            total_gorduras_refeicao += (detalhes.lipidios_g_100g or 0) * proporcao
            alimentos_principais.append(alimento_salvo.nome)
        elif refeicao.analysis_result_json: # Fallback para JSON
            try:
                analise = json.loads(refeicao.analysis_result_json)
                analise_nutricional = analise.get("analise_nutricional", {})
                macronutrientes = analise_nutricional.get("macronutrientes", {})

                total_kcal_refeicao += float(analise_nutricional.get("calorias_totais", 0))
                total_proteinas_refeicao += float(macronutrientes.get("proteinas_g", 0))
                total_carboidratos_refeicao += float(macronutrientes.get("carboidratos_g", 0))
                total_gorduras_refeicao += float(macronutrientes.get("gorduras_g", 0))

                # Tenta pegar alimentos do JSON se não pegou da tabela
                if not alimentos_principais and "alimentos_detectados" in analise:
                    alimentos_principais = [a.get("alimento", "") for a in analise["alimentos_detectados"] if a.get("alimento")]

            except (json.JSONDecodeError, KeyError, ValueError) as e:
                logger.warning(f"Erro ao processar JSON da refeição ID {refeicao.id} (enriquecimento fallback): {e}")
                # Mantém os valores padrão de 0.0

    resultado["kcal_estimadas"] = round(total_kcal_refeicao, 1)
    resultado["proteinas_g"] = round(total_proteinas_refeicao, 1)
    resultado["carboidratos_g"] = round(total_carboidratos_refeicao, 1)
    resultado["gorduras_g"] = round(total_gorduras_refeicao, 1)
    resultado["alimentos_principais"] = alimentos_principais

    # 2️⃣ Gerar suggested_name
    if alimentos_principais:
        if len(alimentos_principais) == 1:
            resultado["suggested_name"] = alimentos_principais[0]
        elif len(alimentos_principais) == 2:
            resultado["suggested_name"] = f"{alimentos_principais[0]} e {alimentos_principais[1]}"
        else:
            resultado["suggested_name"] = f"{alimentos_principais[0]}, {alimentos_principais[1]} e mais"

    # 3️⃣ Inferir tipo de refeição baseado no horário (fuso horário local)
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

def search_alimentos_similar(db: Session, nome_alimento: str, limit: int = 5) -> List[Alimento]:
    """
    Busca alimentos similares usando a extensão pg_trgm (func.similarity).
    Requer que a extensão pg_trgm esteja ativada no banco de dados.
    """
    try:
        nome_normalizado = normalizar_nome_alimento(nome_alimento)

        # 🔹 USANDO func.similarity diretamente com pg_trgm
        alimentos = db.query(Alimento).filter(
            func.lower(Alimento.alimento).contains(nome_normalizado) | # Busca por substring
            func.similarity(Alimento.alimento, nome_normalizado) > 0.2 # Busca por similaridade
        ).order_by(
            func.similarity(Alimento.alimento, nome_normalizado).desc(), # Mais similar primeiro
            func.length(Alimento.alimento) # Menor nome (mais exato)
        ).limit(limit).all()

        logger.info(f"✅ Busca por '{nome_alimento}' retornou {len(alimentos)} resultados.")
        return alimentos

    except SQLAlchemyError as e:
        logger.error(f"❌ Erro na busca de alimentos similares por '{nome_alimento}': {str(e)}")
        # Se pg_trgm não estiver ativado, este erro ocorrerá.
        # Você pode adicionar um fallback para LIKE aqui se quiser, mas o ideal é ativar a extensão.
        return []

# 🔹 REMOVIDO: create_similarity_function_if_not_exists - Deve ser configurado no banco, não no código.
