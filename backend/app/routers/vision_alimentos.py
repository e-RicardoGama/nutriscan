# app/routers/vision_alimentos.py
"""
Router otimizado para endpoints de visão (scan, salvar scan editado, análise detalhada, histórico, resumo).
Substitua completamente o arquivo antigo por este.
"""

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from datetime import datetime
import json
import uuid
import logging

from app.database import get_db
from app import crud
from app.security import get_current_user
from app.gcs_utils import upload_to_gcs  # função que você já usa no projeto

# Schemas / Models (explicit imports)
from app.schemas.vision_alimentos_ import (
    ScanRapidoResponse,
    RefeicaoSalvaIdResponse,
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema,
    RefeicaoSalvaCreate,
    AlimentoSalvoCreate,
    RefeicaoHistoricoItem,
    ResumoDiarioResponse,
    RefeicaoResumoHoje,
    ResumoNutricional,
    MacronutrientesEstimados,
    ScanRapidoAlimento,
    ScanRapidoResultado
    
)

from app.models.usuario import Usuario
from app.models.refeicoes import RefeicaoSalva, RefeicaoStatus, AlimentoSalvo
from app.vision import escanear_prato_extrair_alimentos

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/refeicoes", tags=["Refeições e Análise (Vision)"])


# ----------------------
# Helpers internos
# ----------------------
def _json_dumps_safe(obj: Any) -> str:
    """
    Serialização JSON segura para gravar em DB. Usa default=str para objetos não-serializáveis
    (ex: datetime).
    """
    return json.dumps(obj, ensure_ascii=False, default=str)


def _enqueue_background_analysis(background_tasks: BackgroundTasks, meal_id: int, user_id: int):
    """
    Agenda uma background task que abrirá uma nova sessão DB e chamará a função de análise.
    Fazemos isso para isolar a sessão SQLAlchemy da request atual.
    """
    # A função real que será executada em background é definida abaixo (processar_analise_background)
    background_tasks.add_task(processar_analise_background, meal_id, user_id)


async def processar_analise_background(meal_id: int, user_id: int):
    """
    Abre uma sessão local e invoca a função de CRUD que processa a análise completa.
    Essa função é segura para rodar em background.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    current_user: Usuario = Depends(get_current_user),
    
    try:
        # crud.processar_analise_completa pode ser async; suportamos ambos (await se coroutine)
        result = crud.processar_analise_completa(db=db, meal_id=meal_id, user_id=current_user.id)
        if result is not None and hasattr(result, "__await__"):
            await result


    except Exception as e:
        logger.error(f"Erro na background task de análise (meal_id={meal_id}): {e}", exc_info=True)
        # tenta marcar como falha se possível
        try:
            refeicao = crud.get_refeicao_salva(db=db, meal_id=meal_id, user_id=user_id)
            if refeicao:
                crud.update_refeicao_status(db=db, db_refeicao=refeicao, status=RefeicaoStatus.ANALYSIS_FAILED)
        except Exception:
            logger.warning("Falha ao marcar refeição como FAILED em background", exc_info=True)
    finally:
        db.close()


# ----------------------
# Endpoint: scan rápido
# ----------------------
@router.post("/scan-rapido", response_model=ScanRapidoResponse, status_code=status.HTTP_200_OK)
async def scan_rapido_endpoint(imagem: UploadFile = File(...)):
    """
    Endpoint com parsing ultra-robusto para evitar erros de validação da IA.
    """
    try:
        conteudo_imagem = await imagem.read()

        # 1. Chamada à IA
        ia_response = escanear_prato_extrair_alimentos(conteudo_imagem)

        if not ia_response.get("sucesso"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ia_response.get("erro", "Erro no processamento da IA.")
            )

        conteudo_ia = ia_response.get("conteudo", {})

        # --- FUNÇÕES AUXILIARES DE LIMPEZA ---
        def to_float(val) -> float:
            try:
                if isinstance(val, str):
                    val = val.replace(',', '.')
                return float(val)
            except (ValueError, TypeError):
                return 0.0

        # --- CONSTRUÇÃO DOS SUB-OBJECTOS (Dicionários primeiro para validar depois) ---
        
        # Resumo Nutricional
        resumo_raw = conteudo_ia.get("resumo_nutricional", {})
        macros_raw = resumo_raw.get("macronutrientes_estimados", {})

        macros_obj = MacronutrientesEstimados(
            total_proteinas_g=to_float(macros_raw.get("total_proteinas_g")),
            total_carboidratos_g=to_float(macros_raw.get("total_carboidratos_g")),
            total_gorduras_g=to_float(macros_raw.get("total_gorduras_g"))
        )

        resumo_obj = ResumoNutricional(
            total_calorias=to_float(resumo_raw.get("total_calorias")),
            macronutrientes_estimados=macros_obj,
            vitaminas_minerais_estimados=resumo_raw.get("vitaminas_minerais_estimados") if isinstance(resumo_raw.get("vitaminas_minerais_estimados"), list) else []
        )

        # Alimentos Extraídos (Processamento Seguro Individual)
        lista_alimentos = []
        for item in conteudo_ia.get("alimentos_extraidos", []):
            if not isinstance(item, dict): continue
            try:
                lista_alimentos.append(ScanRapidoAlimento(
                    nome=str(item.get("nome", "Alimento")),
                    categoria=str(item.get("categoria", "Outros")),
                    quantidade_estimada_g=to_float(item.get("quantidade_estimada_g")),
                    confianca=str(item.get("confianca", "baixa")),
                    calorias_estimadas=to_float(item.get("calorias_estimadas")),
                    medida_caseira_sugerida=item.get("medida_caseira_sugerida")
                ))
            except Exception:
                continue # Ignora apenas o alimento malformado

        # --- MONTAGEM DO RESULTADO ---
        resultado_final = ScanRapidoResultado(
            modalidade=str(conteudo_ia.get("modalidade", "rapido")),
            alimentos_extraidos=lista_alimentos,
            resumo_nutricional=resumo_obj,
            alertas=conteudo_ia.get("alertas") if isinstance(conteudo_ia.get("alertas"), list) else [],
            erro=conteudo_ia.get("erro")
        )

        return ScanRapidoResponse(
            sucesso=True,
            status="concluido",
            modalidade="rapido",
            resultado=resultado_final,
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ERRO NO ENDPOINT: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no processamento"
        )

    
# ----------------------
# Endpoint: salvar scan editado
# ----------------------
@router.post("/salvar-scan-editado", response_model=RefeicaoSalvaIdResponse, summary="Salva scan editado (envia imagem + lista de alimentos)")
async def salvar_scan_rapido_editado(
    imagem: UploadFile = File(..., description="Imagem original da refeição"),
    alimentos_json: str = Form(..., description="Lista de alimentos (JSON string)"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """
    Recebe imagem + alimentos (editados) e cria o registro de refeição.
    - Faz upload da imagem para GCS (upload_to_gcs) e grava a refeição + alimentos.
    - Opcionalmente agenda a análise em background.
    """
    logger.info(f"[salvar-scan-editado] user_id={current_user.id} - iniciando")

    # Validação do JSON recebido
    try:
        alimentos_parsed = json.loads(alimentos_json)
        if not isinstance(alimentos_parsed, list):
            raise ValueError("alimentos_json deve ser uma lista JSON")
        alimentos_objs = [AlimentoSalvoCreate(**item) for item in alimentos_parsed]
    except Exception as exc:
        logger.warning("[salvar-scan-editado] payload de alimentos inválido", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Formato inválido para alimentos_json: {exc}")

    # Upload de imagem
    try:
        imagem_bytes = await imagem.read()
        if not imagem_bytes:
            raise HTTPException(status_code=400, detail="Imagem vazia.")

        # nome de arquivo seguro
        extensao = imagem.filename.split(".")[-1] if ("." in imagem.filename) else "jpg"
        file_name = f"refeicoes/{current_user.id}_{uuid.uuid4().hex}.{extensao}"
        bucket_name = "nutriscan-imagens-prod"  # ajuste conforme seu ambiente

        imagem_url = upload_to_gcs(
            bucket_name=bucket_name,
            file_bytes=imagem_bytes,
            destination_blob_name=file_name,
            content_type=imagem.content_type
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[salvar-scan-editado] erro no upload: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da imagem: {exc}")

    # Monta schema RefeicaoSalvaCreate e grava com CRUD
    try:
        refeicao_payload = RefeicaoSalvaCreate(
            alimentos=alimentos_objs,
            imagem_url=imagem_url
        )
        db_refeicao = crud.create_refeicao_salva(db=db, refeicao_data=refeicao_payload, user_id=current_user.id)
        if not db_refeicao or not getattr(db_refeicao, "id", None):
            logger.error("[salvar-scan-editado] create_refeicao_salva retornou sem ID")
            raise HTTPException(status_code=500, detail="Não foi possível criar a refeição no banco.")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[salvar-scan-editado] erro ao criar refeição: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao salvar a refeição: {exc}")

    # Opcional: agenda a análise em background (recomendado)
    try:
        if background_tasks is not None:
            _enqueue_background_analysis(background_tasks, db_refeicao.id, current_user.id)
        else:
            # se não foi passado BackgroundTasks, tentamos iniciar de forma não-bloqueante
            # (isso não deve ocorrer em FastAPI normal; BackgroundTasks é a forma correta)
            pass
    except Exception as exc:
        logger.warning(f"[salvar-scan-editado] falha ao agendar análise em background: {exc}", exc_info=True)

    logger.info(f"[salvar-scan-editado] refeição criada meal_id={db_refeicao.id}")
    return RefeicaoSalvaIdResponse(meal_id=db_refeicao.id)


# ----------------------
# Endpoint: analisar detalhadamente (sync)
# ----------------------
@router.post("/analisar-detalhadamente/{meal_id}",
             response_model=AnaliseCompletaResponseSchema,
             summary="Executa análise detalhada para a refeição (usa dados no DB)")
async def analisar_refeicao_detalhadamente_por_id(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Executa a análise detalhada utilizando os alimentos já salvos na refeição.
    Essa rota tenta processar na hora (síncrono). Se for muito pesada, prefira /analise-status
    e agende via background (quando salvar).
    """
    logger.info(f"[analisar-detalhadamente] meal_id={meal_id} user_id={current_user.id}")

    # Recupera refeição com relacionamentos carregados
    db_refeicao: Optional[RefeicaoSalva] = crud.get_refeicao_salva(db=db, meal_id=meal_id, user_id=current_user.id)
    if not db_refeicao:
        logger.debug("[analisar-detalhadamente] refeição não encontrada")
        raise HTTPException(status_code=404, detail="Refeição não encontrada.")

    if not db_refeicao.alimentos or len(db_refeicao.alimentos) == 0:
        raise HTTPException(status_code=400, detail="Refeição sem alimentos para análise.")

    try:
        # Chama a implementação centralizada de análise (no crud)
        # Pode ser sync ou async; lidamos com ambas
        result = crud.processar_analise_completa(db=db, meal_id=meal_id, user_id=current_user.id)
        if hasattr(result, "__await__"):
            # se for coroutine
            await result

        # Recarrega o registro do DB
        db.refresh(db_refeicao)

        if not db_refeicao.analysis_result_json:
            # algo deu errado durante a gravação
            raise HTTPException(status_code=500, detail="Análise não foi salva corretamente no banco.")

        # Carrega JSON seguro e valida via schema
        analytic_data = json.loads(db_refeicao.analysis_result_json)
        return AnaliseCompletaResponseSchema(**analytic_data)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[analisar-detalhadamente] erro ao analisar meal_id={meal_id}: {exc}", exc_info=True)
        # Marca como falha
        try:
            crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_FAILED)
        except Exception:
            logger.warning("[analisar-detalhadamente] falha ao marcar status FAILED", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao realizar análise detalhada: {exc}")


# ----------------------
# Endpoint: analisar status (polling)
# ----------------------
@router.get("/analise-status/{meal_id}", summary="Retorna o status da análise para polling")
async def get_analise_status(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    refeicao = db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == current_user.id
    ).first()
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada.")

    return {
        "status": refeicao.status,
        "progresso": "complete" if refeicao.status == RefeicaoStatus.ANALYSIS_COMPLETE else "processing",
        "tem_analise": bool(refeicao.analysis_result_json)
    }


# ----------------------
# Endpoint: histórico (resumos)
# ----------------------
@router.get("/historico", response_model=List[RefeicaoHistoricoItem], summary="Lista histórico de refeições (resumo)")
def get_historico_refeicoes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    refeicoes_db = crud.get_historico_refeicoes_por_usuario(db=db, user_id=current_user.id)
    resultado = []
    for r in refeicoes_db:
        total_calorias = None
        try:
            if r.analysis_result_json:
                parsed = json.loads(r.analysis_result_json)
                total_calorias = parsed.get("analise_nutricional", {}).get("calorias_totais")
        except Exception:
            logger.debug(f"[historico] falha ao parsear analysis_result_json para id={r.id}", exc_info=False)
        resultado.append(RefeicaoHistoricoItem(
            id=r.id,
            data_criacao=r.created_at,
            imagem_url=r.imagem_url,
            total_calorias=total_calorias
        ))
    return resultado


# ----------------------
# Endpoint: detalhe (retorna análise completa)
# ----------------------
@router.get("/detalhe/{meal_id}", response_model=AnaliseCompletaResponseSchema, summary="Retorna análise salva por ID")
def get_detalhe_refeicao(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    refeicao = crud.get_detalhe_refeicao_por_id(db=db, meal_id=meal_id, user_id=current_user.id)
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada ou não pertence a este usuário.")

    if not refeicao.analysis_result_json:
        raise HTTPException(status_code=404, detail="A análise detalhada para esta refeição ainda não foi gerada ou falhou.")

    try:
        analise_salva = json.loads(refeicao.analysis_result_json)
        return AnaliseCompletaResponseSchema(**analise_salva)
    except Exception as exc:
        logger.error(f"[detalhe] erro ao carregar JSON da análise meal_id={meal_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao ler dados da análise salva.")


# ----------------------
# Endpoint: resumo diário / refeições hoje
# ----------------------
@router.get("/resumo-diario", response_model=ResumoDiarioResponse, summary="Consumo de macros hoje")
def get_resumo_diario(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    resumo = crud.get_consumo_macros_hoje(db=db, user_id=current_user.id)
    if not resumo:
        return ResumoDiarioResponse(total_calorias=0, total_proteinas_g=0, total_carboidratos_g=0, total_gorduras_g=0)
    return ResumoDiarioResponse(**resumo)


@router.get("/refeicoes-hoje", response_model=List[RefeicaoResumoHoje], summary="Lista refeições do dia (enriquecidas)")
def get_refeicoes_hoje(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    refeicoes_db = crud.get_refeicoes_hoje_por_usuario(db=db, user_id=current_user.id)
    resultado = []
    for r in refeicoes_db:
        dados = crud.enriquecer_refeicao_com_analise(r)
        resultado.append(RefeicaoResumoHoje(**dados))
    return resultado
