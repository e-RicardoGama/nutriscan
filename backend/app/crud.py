# app/crud.py
# VERSÃO OTIMIZADA - SUBSTITUA TODO O ARQUIVO

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, cast, Date
from typing import Optional, List, Dict, Any
import json
import time
import threading
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
import logging

# Configuração do logging
logger = logging.getLogger(__name__)

# --- Imports Explícitos ---
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.models.usuario import Usuario
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import RefeicaoSalvaCreate
from app.vision import fetch_gemini_nutritional_data, gerar_recomendacoes_detalhadas_ia

# --- CACHE E RATE LIMITING ---
_cache_lock = threading.RLock()
_alimento_cache = {}
_last_gemini_call = 0
GEMINI_RATE_LIMIT = 0.5  # 500ms entre chamadas

def rate_limited_gemini_call():
    """Implementa rate limiting para chamadas ao Gemini"""
    global _last_gemini_call
    now = time.time()
    elapsed = now - _last_gemini_call
    if elapsed < GEMINI_RATE_LIMIT:
        time.sleep(GEMINI_RATE_LIMIT - elapsed)
    _last_gemini_call = time.time()

def clear_alimento_cache():
    """Limpa o cache de alimentos"""
    with _cache_lock:
        _alimento_cache.clear()

# --- FUNÇÕES AUXILIARES OTIMIZADAS ---

def normalizar_nome_alimento(nome: str) -> str:
    """Normaliza o nome do alimento para comparações"""
    if not nome:
        return ""
    nome = nome.strip().lower()
    nome = ' '.join(nome.split())  # Remove espaços múltiplos
    return nome

def bulk_get_alimentos_data(db: Session, nomes_alimentos: List[str]) -> Dict[str, Alimento]:
    """Busca dados de múltiplos alimentos em uma única query (MUITO mais rápido)"""
    if not nomes_alimentos:
        return {}
    
    nomes_normalizados = [normalizar_nome_alimento(nome) for nome in nomes_alimentos]
    
    alimentos = db.query(Alimento).filter(
        func.lower(Alimento.alimento_normalizado).in_([n.lower() for n in nomes_normalizados])
    ).all()
    
    return {normalizar_nome_alimento(alimento.alimento): alimento for alimento in alimentos}

def get_or_create_alimento_by_nome_optimized(db: Session, nome: str, criar_novo: bool = True) -> Optional[Alimento]:
    """Versão otimizada com cache e rate limiting"""
    nome_normalizado = normalizar_nome_alimento(nome)
    
    # 1. Verifica cache primeiro (MUITO RÁPIDO)
    with _cache_lock:
        if nome_normalizado in _alimento_cache:
            cached = _alimento_cache[nome_normalizado]
            if cached is not None:
                logger.info(f"✅ Cache hit: '{nome}'")
                return cached
    
    # 2. Busca no banco
    alimento_existente = db.query(Alimento).filter(
        func.lower(Alimento.alimento_normalizado) == nome_normalizado
    ).first()
    
    if alimento_existente:
        with _cache_lock:
            _alimento_cache[nome_normalizado] = alimento_existente
        return alimento_existente
    
    # 3. Se não encontrou e pode criar novo, chama Gemini
    if criar_novo:
        logger.info(f"🔄 Alimento não encontrado. Consultando Gemini para: '{nome}'")
        
        # Rate limiting para não sobrecarregar a API
        rate_limited_gemini_call()
        
        dados_ia = fetch_gemini_nutritional_data(nome)
        
        if "erro" in dados_ia:
            logger.error(f"❌ Erro ao obter dados do Gemini para '{nome}': {dados_ia.get('erro')}")
            with _cache_lock:
                _alimento_cache[nome_normalizado] = None
            return None
        
        # Cria novo alimento
        try:
            novo_alimento = Alimento(
                categoria=dados_ia.get("categoria", "Outros"),
                alimento_normalizado=nome_normalizado,
                alimentos=nome,
                alimento=dados_ia.get("alimento", nome),
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
                un_medida_caseira=dados_ia.get("un_medida_caseira"),
                peso_aproximado_g=float(dados_ia.get("peso_aproximado_g", 100) or 100),
            )
            
            db.add(novo_alimento)
            db.commit()
            db.refresh(novo_alimento)
            
            with _cache_lock:
                _alimento_cache[nome_normalizado] = novo_alimento
                
            logger.info(f"✅ Novo alimento criado e salvo: '{nome}' (ID: {novo_alimento.id})")
            return novo_alimento
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar novo alimento '{nome}': {e}")
            db.rollback()
            with _cache_lock:
                _alimento_cache[nome_normalizado] = None
            return None
    
    with _cache_lock:
        _alimento_cache[nome_normalizado] = None
    return None

# --- CRUD OTIMIZADO PARA REFEIÇÕES ---

def create_refeicao_salva(db: Session, refeicao_data: RefeicaoSalvaCreate, user_id: int) -> RefeicaoSalva:
    """Versão OTIMIZADA com bulk loading e cache"""
    logger.info(f"🛠️ Criando refeição salva para user_id {user_id} com {len(refeicao_data.alimentos)} alimentos")

    # 1️⃣ Cria a refeição base
    db_refeicao = RefeicaoSalva(
        owner_id=user_id,
        status=RefeicaoStatus.PENDING_ANALYSIS,
        imagem_url=refeicao_data.imagem_url
    )
    db.add(db_refeicao)
    db.flush()

    # 2️⃣ BULK LOADING: Busca todos os alimentos de uma vez
    todos_nomes = [alimento.nome for alimento in refeicao_data.alimentos]
    alimentos_map = bulk_get_alimentos_data(db, todos_nomes)
    
    # 3️⃣ Processa cada alimento com dados já carregados
    alimentos_processados = []
    for i, alimento_data in enumerate(refeicao_data.alimentos):
        try:
            if hasattr(alimento_data, 'model_dump'):
                payload = alimento_data.model_dump()
            else:
                payload = alimento_data.dict()

            nome_alimento = payload.get("nome", "")
            
            # Busca no cache/map primeiro
            alimento_registro = alimentos_map.get(normalizar_nome_alimento(nome_alimento))
            
            # Se não encontrou, tenta criar (com cache)
            if not alimento_registro:
                alimento_registro = get_or_create_alimento_by_nome_optimized(db, nome_alimento, criar_novo=True)
            
            alimento_id = alimento_registro.id if alimento_registro else None

            # Cria AlimentoSalvo
            db_alimento_salvo = AlimentoSalvo(
                **payload,
                refeicao_id=db_refeicao.id,
                alimento_id=alimento_id
            )
            db.add(db_alimento_salvo)
            alimentos_processados.append({
                "nome": nome_alimento,
                "alimento_id": alimento_id,
                "quantidade_g": payload.get("quantidade_estimada_g")
            })

        except Exception as e:
            logger.error(f"❌ Erro ao processar alimento '{nome_alimento}': {e}")
            continue

    # 4️⃣ Finaliza a transação
    try:
        db.commit()
        db.refresh(db_refeicao)

        logger.info(f"✅ Refeição salva criada (ID: {db_refeicao.id}) com {len(alimentos_processados)} alimentos processados")
        return db_refeicao

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao salvar refeição: {e}")
        raise

# --- FUNÇÃO DE ANÁLISE COMPLETA EM BACKGROUND ---

async def processar_analise_completa(db: Session, meal_id: int, user_id: int):
    """Processa a análise completa em background"""
    try:
        logger.info(f"🔄 Iniciando análise em background para meal_id: {meal_id}")
        
        db_refeicao = get_refeicao_salva(db=db, meal_id=meal_id, user_id=user_id)
        if not db_refeicao:
            logger.error(f"❌ Refeição {meal_id} não encontrada para análise em background")
            return

        alimentos_salvos = db_refeicao.alimentos
        if not alimentos_salvos:
            logger.error(f"❌ Refeição {meal_id} sem alimentos para análise")
            return

        # Lógica de análise (igual à sua versão anterior, mas mais rápida)
        lista_alimentos_para_ia = []
        detalhes_prato_resposta = []
        
        total_calorias = 0.0
        total_proteinas = 0.0
        total_carboidratos = 0.0
        total_gorduras = 0.0

        for alimento_salvo in alimentos_salvos:
            if alimento_salvo.quantidade_estimada_g is None or alimento_salvo.quantidade_estimada_g <= 0:
                continue

            alimento_detalhes = alimento_salvo.alimento_detalhes
            if not alimento_detalhes:
                continue

            # Cálculos rápidos
            ratio = alimento_salvo.quantidade_estimada_g / 100.0
            total_calorias += (alimento_detalhes.energia_kcal_100g or 0) * ratio
            total_proteinas += (alimento_detalhes.proteina_g_100g or 0) * ratio
            total_carboidratos += (alimento_detalhes.carboidrato_g_100g or 0) * ratio
            total_gorduras += (alimento_detalhes.lipidios_g_100g or 0) * ratio

            detalhes_prato_resposta.append({
                "nome": alimento_salvo.nome,
                "quantidade_gramas": alimento_salvo.quantidade_estimada_g,
                "metodo_preparo": "Não especificado",
                "medida_caseira_sugerida": f"{alimento_detalhes.unidades or 1} {alimento_detalhes.un_medida_caseira or 'g'}"
            })
            
            lista_alimentos_para_ia.append({
                "nome": alimento_salvo.nome,
                "quantidade_gramas": alimento_salvo.quantidade_estimada_g
            })

        # Gera recomendações
        totais_calculados = {
            "kcal": total_calorias,
            "protein": total_proteinas,
            "carbs": total_carboidratos,
            "fats": total_gorduras
        }

        dados_ia = gerar_recomendacoes_detalhadas_ia(
            lista_alimentos=lista_alimentos_para_ia,
            totais=totais_calculados
        )

        # Monta resposta final
        from app.schemas.vision_alimentos_ import (
            AnaliseCompletaResponseSchema, DetalhesPrato, AnaliseNutricional, 
            Macronutrientes, Recomendacoes, AlimentoDetalhado
        )

        resultado_analise = AnaliseCompletaResponseSchema(
            detalhes_prato=DetalhesPrato(
                alimentos=[AlimentoDetalhado(**item) for item in detalhes_prato_resposta]
            ),
            analise_nutricional=AnaliseNutricional(
                calorias_totais=round(total_calorias),
                macronutrientes=Macronutrientes(
                    proteinas_g=round(total_proteinas, 1),
                    carboidratos_g=round(total_carboidratos, 1),
                    gorduras_g=round(total_gorduras, 1)
                )
            ),
            recomendacoes=Recomendacoes(
                pontos_positivos=dados_ia.get("recomendacoes", {}).get("pontos_positivos", ["Análise concluída."]),
                sugestoes_balanceamento=dados_ia.get("recomendacoes", {}).get("sugestoes_balanceamento", ["Não foi possível gerar sugestões."]),
                alternativas_saudaveis=dados_ia.get("recomendacoes", {}).get("alternativas_saudaveis", [])
            )
        )

        # Salva no banco
        analysis_dict = resultado_analise.model_dump()
        db_refeicao.analysis_result_json = json.dumps(analysis_dict, ensure_ascii=False)
        update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_COMPLETE)
        
        logger.info(f"✅ Análise em background concluída para meal_id: {meal_id}")

    except Exception as e:
        logger.error(f"❌ Erro na análise em background para meal_id {meal_id}: {e}")
        if 'db_refeicao' in locals():
            update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_FAILED)

# --- FUNÇÕES EXISTENTES (MANTIDAS) ---

def get_refeicao_salva(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == user_id
    ).options(
        joinedload(RefeicaoSalva.alimentos).joinedload(AlimentoSalvo.alimento_detalhes)
    ).first()

def update_refeicao_status(db: Session, db_refeicao: RefeicaoSalva, status: RefeicaoStatus) -> RefeicaoSalva:
    db_refeicao.status = status
    db_refeicao.updated_at = datetime.now()
    db.commit()
    db.refresh(db_refeicao)
    return db_refeicao

def get_historico_refeicoes_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id
    ).order_by(RefeicaoSalva.created_at.desc()).all()

def get_detalhe_refeicao_por_id(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == user_id
    ).options(
        joinedload(RefeicaoSalva.alimentos).joinedload(AlimentoSalvo.alimento_detalhes)
    ).first()

def get_consumo_macros_hoje(db: Session, user_id: int) -> dict:
    tz = ZoneInfo("America/Sao_Paulo")
    inicio_hoje = datetime.now(tz).replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_amanha = inicio_hoje + timedelta(days=1)

    refeicoes_hoje = db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id,
        RefeicaoSalva.created_at >= inicio_hoje,
        RefeicaoSalva.created_at < inicio_amanha,
    ).all()

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
                logger.error(f"Erro ao processar JSON da refeição ID {refeicao.id}: {e}")

    return {
        "total_calorias": round(total_calorias, 1),
        "total_proteinas_g": round(total_proteinas_g, 1),
        "total_carboidratos_g": round(total_carboidratos_g, 1),
        "total_gorduras_g": round(total_gorduras_g, 1)
    }

def get_refeicoes_hoje_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    tz = ZoneInfo("America/Sao_Paulo")
    inicio_hoje = datetime.now(tz).replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_amanha = inicio_hoje + timedelta(days=1)

    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id,
        RefeicaoSalva.created_at >= inicio_hoje,
        RefeicaoSalva.created_at < inicio_amanha,
        RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE,
    ).order_by(RefeicaoSalva.created_at.asc()).all()

def enriquecer_refeicao_com_analise(refeicao: RefeicaoSalva) -> dict:
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
        "alimentos_vinculados": 0,
        "alimentos_sem_vinculo": 0
    }

    if refeicao.analysis_result_json:
        try:
            analise = json.loads(refeicao.analysis_result_json)
            analise_nutricional = analise.get("analise_nutricional", {})
            resultado["kcal_estimadas"] = analise_nutricional.get("calorias_totais")
            macros = analise_nutricional.get("macronutrientes", {})
            resultado["proteinas_g"] = macros.get("proteinas_g")
            resultado["carboidratos_g"] = macros.get("carboidratos_g")
            resultado["gorduras_g"] = macros.get("gorduras_g")
        except Exception as e:
            logger.error(f"Erro ao processar JSON da refeição ID {refeicao.id}: {e}")

    if refeicao.alimentos:
        alimentos_vinculados = 0
        alimentos_sem_vinculo = 0
        alimentos_principais = []
        
        for alimento in refeicao.alimentos[:3]:
            alimentos_principais.append(alimento.nome)
            if alimento.alimento_id:
                alimentos_vinculados += 1
            else:
                alimentos_sem_vinculo += 1

        resultado["alimentos_principais"] = alimentos_principais
        resultado["alimentos_vinculados"] = alimentos_vinculados
        resultado["alimentos_sem_vinculo"] = alimentos_sem_vinculo

        if alimentos_principais:
            if len(alimentos_principais) == 1:
                resultado["suggested_name"] = alimentos_principais[0]
            elif len(alimentos_principais) == 2:
                resultado["suggested_name"] = f"{alimentos_principais[0]} e {alimentos_principais[1]}"
            else:
                resultado["suggested_name"] = f"{alimentos_principais[0]}, {alimentos_principais[1]} e mais"

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