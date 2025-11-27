# app/routers/vision_alimentos.py
# VERSÃO OTIMIZADA - SUBSTITUA TODO O ARQUIVO

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func 
from typing import List, Any, Dict, Optional
from datetime import datetime
import json
import uuid
import asyncio
import time
import logging
from app.gcs_utils import upload_to_gcs

# --- Imports Explícitos ---
from app.database import get_db
from app import crud
from app.models.alimentos import Alimento
from app.models.usuario import Usuario 
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.security import get_current_user
from app.crud import (
    create_refeicao_salva,
    get_refeicao_salva, 
    update_refeicao_status,
    get_historico_refeicoes_por_usuario,
    get_detalhe_refeicao_por_id,
    get_consumo_macros_hoje,
    get_refeicoes_hoje_por_usuario,
    processar_analise_completa  # ✅ NOVO
)

# Importa schemas
from app.schemas.vision_alimentos_ import ( 
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema, 
    AlimentoSalvoCreate,
    RefeicaoSalvaIdResponse,
    ScanRapidoResponse,
    RefeicaoSalvaCreate,
    AlimentoDetalhado, 
    DetalhesPrato, 
    AnaliseNutricional, 
    Macronutrientes, 
    Recomendacoes,
    RefeicaoHistoricoItem,
    ResumoDiarioResponse,
    RefeicaoResumoHoje,
)

from app.vision import (
    escanear_prato_extrair_alimentos,
    gerar_recomendacoes_detalhadas_ia
)

# Configuração de logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/refeicoes",
    tags=["Refeições e Análise (Vision)"]
)


# ---------------------------------------------------------------
# ENDPOINT 0: SCAN RÁPIDO
# ---------------------------------------------------------------
@router.post("/scan-rapido", response_model=ScanRapidoResponse, summary="Realiza scan rápido")
async def scan_rapido(
    imagem: UploadFile = File(..., description="Imagem da refeição (JPEG/PNG, máx 10MB)"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    logger.info("🎯 [ENDPOINT] /scan-rapido CHAMADO!")

    try:
        # ------------------------------------------------------
        # 1) Ler imagem
        # ------------------------------------------------------
        imagem_bytes = await imagem.read()
        logger.info(f"📦 [ENDPOINT] Imagem lida: {len(imagem_bytes)} bytes")

        # ------------------------------------------------------
        # 2) Validações de imagem
        # ------------------------------------------------------
        if not imagem.content_type or not imagem.content_type.startswith('image/'):
            logger.error("🚫 [ENDPOINT] Arquivo não é imagem")
            raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")

        if len(imagem_bytes) == 0:
            logger.error("🚫 [ENDPOINT] Imagem vazia")
            raise HTTPException(status_code=400, detail="Imagem vazia")

        if len(imagem_bytes) > 10 * 1024 * 1024:
            logger.error("🚫 [ENDPOINT] Imagem muito grande")
            raise HTTPException(status_code=400, detail="Imagem muito grande (máx. 10MB)")

        # ------------------------------------------------------
        # 3) Chamada NÃO BLOQUEANTE ao processamento de visão
        # ------------------------------------------------------
        logger.info("🤖 [ENDPOINT] Chamando escanear_prato_extrair_alimentos...")

        loop = asyncio.get_running_loop()
        resultado_scan = await loop.run_in_executor(
            None, 
            escanear_prato_extrair_alimentos, 
            imagem_bytes
        )

        # ------------------------------------------------------
        # 4) LOG DEBUG seguro do retorno bruto
        # ------------------------------------------------------
        logger.debug(f"🔎 [ENDPOINT] Resultado bruto do scan (DEBUG): {resultado_scan}")

        # ------------------------------------------------------
        # 5) Validação da estrutura de resultado_scan
        # ------------------------------------------------------
        if not isinstance(resultado_scan, dict):
            logger.error("❌ [ENDPOINT] resultado_scan não é um dicionário válido")
            raise HTTPException(status_code=500, detail="Erro interno: resposta inválida do serviço de visão")

        # Chaves mínimas esperadas
        for chave in ["sucesso", "erro", "bloqueada", "conteudo"]:
            if chave not in resultado_scan:
                logger.error(f"❌ [ENDPOINT] Chave ausente em resultado_scan: {chave}")
                raise HTTPException(status_code=500, detail="Erro interno: resposta incompleta do serviço de visão")

        # ------------------------------------------------------
        # 6) Tratamento dos erros vindos do Gemini
        # ------------------------------------------------------
        if not resultado_scan.get("sucesso"):
            # Conteúdo bloqueado
            if resultado_scan.get("bloqueada"):
                logger.warning(f"🚫 [ENDPOINT] Conteúdo bloqueado pelo Gemini: {resultado_scan.get('erro')}")
                raise HTTPException(status_code=400, detail="Conteúdo bloqueado")

            # Erro interno do Gemini / parsing / JSON vazio
            logger.error(f"💥 [ENDPOINT] Erro no scan: {resultado_scan.get('erro')}")
            raise HTTPException(
                status_code=500,
                detail="Não foi possível processar a imagem. Tente novamente."
            )

        # ------------------------------------------------------
        # 7) Validação do conteúdo final
        # ------------------------------------------------------
        conteudo = resultado_scan.get("conteudo")
        if conteudo is None:
            logger.error("❌ [ENDPOINT] Conteúdo ausente apesar de sucesso=True")
            raise HTTPException(status_code=500, detail="Erro interno: conteúdo ausente do serviço de visão")

        # ------------------------------------------------------
        # 8) Sucesso — retorno final
        logger.info("🎉 [ENDPOINT] Scan concluído com sucesso!")

        return ScanRapidoResponse(
            status="sucesso",
            modalidade="scan_rapido",
            resultado=conteudo,
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        logger.warning("⚠️ [ENDPOINT] HTTPException re-levantada.")
        raise

    except Exception as e:
        logger.error(
            f"💥 [ENDPOINT] Erro inesperado no endpoint /scan-rapido: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Erro inesperado. Consulte os logs do servidor."
        )
    
# ---------------------------------------------------------------
# ENDPOINT 1: SALVAR SCAN EDITADO
# ---------------------------------------------------------------
@router.post(
    "/salvar-scan-editado",
    response_model=RefeicaoSalvaIdResponse,
    summary="Salva scan editado e faz upload da imagem",
)
async def salvar_scan_rapido_editado(
    imagem: UploadFile = File(..., description="A imagem original da refeição"),
    alimentos_json: str = Form(..., description="A lista de alimentos editados em formato JSON string"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        alimentos_data = json.loads(alimentos_json)
        alimentos_editados: List[AlimentoSalvoCreate] = [AlimentoSalvoCreate(**alimento) for alimento in alimentos_data]
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato JSON inválido para 'alimentos_json': {exc}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro na validação dos dados dos alimentos: {exc}"
        )

    if not alimentos_editados:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A lista de alimentos não pode estar vazia."
        )

    # Upload para GCS
    imagem_url_publica = None
    try:
        imagem_bytes = await imagem.read()
        bucket_name = "nutriscan-imagens-prod"
        extensao = imagem.filename.split('.')[-1] if '.' in imagem.filename else 'jpg'
        file_name = f"refeicoes/{current_user.id}_{uuid.uuid4().hex}.{extensao}"

        imagem_url_publica = upload_to_gcs(
            bucket_name=bucket_name,
            file_bytes=imagem_bytes,
            destination_blob_name=file_name,
            content_type=imagem.content_type
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao salvar a imagem: {exc}"
        )

    # Criar refeição
    refeicao_data = RefeicaoSalvaCreate(
        alimentos=alimentos_editados,
        imagem_url=imagem_url_publica
    )

    try:
        db_refeicao = create_refeicao_salva(db=db, refeicao_data=refeicao_data, user_id=current_user.id)
        if not db_refeicao:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Não foi possível criar a refeição no banco.")
        return RefeicaoSalvaIdResponse(meal_id=db_refeicao.id)
    except Exception as exc:
        logger.error(f"Erro ao salvar refeição editada user {current_user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao salvar a refeição: {exc}"
        )

# ---------------------------------------------------------------
# ENDPOINT 2: ANÁLISE DETALHADA ASSÍNCRONA (OTIMIZADA)
# ---------------------------------------------------------------
@router.post("/analisar-detalhadamente/{meal_id}", 
             response_model=AnaliseCompletaResponseSchema,
             summary="Inicia análise assíncrona")
async def analisar_refeicao_detalhadamente_por_id(
    meal_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Validação rápida
    db_refeicao = crud.get_refeicao_salva(db=db, meal_id=meal_id, user_id=current_user.id)
    if not db_refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada.")
    
    # Resposta imediata ao usuário
    response_base = AnaliseCompletaResponseSchema(
        detalhes_prato=DetalhesPrato(alimentos=[]),
        analise_nutricional=AnaliseNutricional(
            calorias_totais=0,
            macronutrientes=Macronutrientes(proteinas_g=0, carboidratos_g=0, gorduras_g=0)
        ),
        recomendacoes=Recomendacoes(
            pontos_positivos=["Análise em andamento..."],
            sugestoes_balanceamento=[],
            alternativas_saudaveis=[]
        )
    )
    
    # Processa em background
    background_tasks.add_task(processar_analise_background, meal_id, current_user.id)
    
    return response_base

# ✅ FUNÇÃO DE BACKGROUND
async def processar_analise_background(meal_id: int, user_id: int):
    """Processa a análise pesada em background"""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        await processar_analise_completa(db, meal_id, user_id)
    except Exception as e:
        logger.error(f"Erro em background task para meal_id {meal_id}: {e}")
    finally:
        db.close()

# ---------------------------------------------------------------
# ENDPOINT 3: STATUS DA ANÁLISE
# ---------------------------------------------------------------
@router.get("/analise-status/{meal_id}")
async def get_analise_status(
    meal_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Permite ao frontend verificar o progresso"""
    refeicao = db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == current_user.id
    ).first()
    
    if not refeicao:
        return {"status": "not_found"}
    
    return {
        "status": refeicao.status,
        "progresso": "complete" if refeicao.status == RefeicaoStatus.ANALYSIS_COMPLETE else "processing",
        "tem_analise": refeicao.analysis_result_json is not None
    }

# ---------------------------------------------------------------
# ENDPOINT 4: GET HISTÓRICO
# ---------------------------------------------------------------
@router.get(
    "/historico", 
    response_model=List[RefeicaoHistoricoItem],
    summary="Lista o histórico de refeições (resumo) do usuário"
)
def get_historico_refeicoes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    refeicoes_db = crud.get_historico_refeicoes_por_usuario(db, user_id=current_user.id)
    resultado_historico = []
    
    for refeicao in refeicoes_db:
        total_calorias = None
        if refeicao.analysis_result_json:
            try:
                analise_data = json.loads(refeicao.analysis_result_json)
                total_calorias = analise_data.get("analise_nutricional", {}).get("calorias_totais")
            except:
                pass 

        resultado_historico.append(
            RefeicaoHistoricoItem(
                id=refeicao.id,
                data_criacao=refeicao.created_at,
                imagem_url=refeicao.imagem_url,
                total_calorias=total_calorias
            )
        )
    return resultado_historico

# ---------------------------------------------------------------
# ENDPOINT 5: GET DETALHE
# ---------------------------------------------------------------
@router.get(
    "/detalhe/{meal_id}", 
    response_model=AnaliseCompletaResponseSchema,
    summary="Busca uma análise detalhada completa pelo ID"
)
def get_detalhe_refeicao(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    refeicao = crud.get_detalhe_refeicao_por_id(db, meal_id=meal_id, user_id=current_user.id)
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada ou não pertence a este usuário.")

    if not refeicao.analysis_result_json:
        raise HTTPException(status_code=404, detail="A análise detalhada para esta refeição ainda não foi gerada ou falhou.")
        
    try:
        analise_salva = json.loads(refeicao.analysis_result_json)
        return AnaliseCompletaResponseSchema(**analise_salva)
    except Exception as e:
        logger.error(f"Erro ao carregar JSON da análise: {e}")
        raise HTTPException(status_code=500, detail="Erro ao ler dados da análise salva.")

# ---------------------------------------------------------------
# ENDPOINT 6: GET RESUMO DIÁRIO
# ---------------------------------------------------------------
@router.get(
    "/resumo-diario", 
    response_model=ResumoDiarioResponse,
    summary="Calcula o consumo total de macros do usuário para hoje"
)
def get_resumo_diario(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    resumo_dict = crud.get_consumo_macros_hoje(db, user_id=current_user.id)
    
    if not resumo_dict:
        return ResumoDiarioResponse(
            total_calorias=0,
            total_proteinas_g=0,
            total_carboidratos_g=0,
            total_gorduras_g=0
        )

    return ResumoDiarioResponse(**resumo_dict)

# ---------------------------------------------------------------
# ENDPOINT 7: GET LISTA DE REFEIÇÕES DE HOJE
# ---------------------------------------------------------------
@router.get(
    "/refeicoes-hoje",
    response_model=List[RefeicaoResumoHoje],
    summary="Lista as refeições (enriquecidas) do usuário para hoje"
)
def get_refeicoes_hoje(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    refeicoes_db = crud.get_refeicoes_hoje_por_usuario(db, user_id=current_user.id)
    
    resultado_lista = []
    for refeicao in refeicoes_db:
        dados_enriquecidos = crud.enriquecer_refeicao_com_analise(refeicao)
        resultado_lista.append(RefeicaoResumoHoje(**dados_enriquecidos))
    
    return resultado_lista
