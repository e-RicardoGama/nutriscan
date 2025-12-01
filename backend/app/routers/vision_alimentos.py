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
    try:
        # crud.processar_analise_completa pode ser async; suportamos ambos (await se coroutine)
        result = crud.processar_analise_completa(db=db, meal_id=meal_id, user_id=user_id)
        # Se for coroutine (async fn), await
        if hasattr(result, "__await__"):
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
    Endpoint para realizar um scan rápido de uma imagem de refeição.
    Retorna alimentos extraídos e um resumo nutricional estimado.
    """
    try:
        conteudo_imagem = await imagem.read()

        # Chama a função do vision.py para interagir com o Gemini
        ia_response = escanear_prato_extrair_alimentos(conteudo_imagem)

        if not ia_response["sucesso"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ia_response.get("erro", "Erro desconhecido no processamento da imagem pela IA.")
            )

        # Extrai o conteúdo principal da resposta da IA
        conteudo_ia = ia_response.get("conteudo", {})

        # Preenche com valores padrão se o Gemini não retornar tudo
        # Isso garante que o Pydantic receba uma estrutura completa
        resumo_nutricional_ia = conteudo_ia.get("resumo_nutricional", {})
        macronutrientes_ia = resumo_nutricional_ia.get("macronutrientes_estimados", {})

        # Cria uma instância de ResumoNutricional com defaults ou valores da IA
        resumo_nutricional_final = ResumoNutricional(
            total_calorias=resumo_nutricional_ia.get("total_calorias", 0.0),
            macronutrientes_estimados=MacronutrientesEstimados(
                total_proteinas_g=macronutrientes_ia.get("total_proteinas_g", 0.0),
                total_carboidratos_g=macronutrientes_ia.get("total_carboidratos_g", 0.0),
                total_gorduras_g=macronutrientes_ia.get("total_gorduras_g", 0.0),
            ),
            vitaminas_minerais_estimados=resumo_nutricional_ia.get("vitaminas_minerais_estimados", []),
        )

        # Cria uma instância de ScanRapidoResultado com defaults ou valores da IA
        resultado_final = ScanRapidoResultado(
            modalidade=conteudo_ia.get("modalidade", "rapido"),
            alimentos_extraidos=[
                ScanRapidoAlimento(**alimento) for alimento in conteudo_ia.get("alimentos_extraidos", [])
            ],
            resumo_nutricional=resumo_nutricional_final,
            alertas=conteudo_ia.get("alertas", []),
            erro=conteudo_ia.get("erro", None),
        )

        # Constrói a resposta final usando o ScanRapidoResponse
        response_data = ScanRapidoResponse(
            sucesso=True,
            erro=None,
            bloqueada=False,
            status="concluido",
            modalidade="rapido",
            resultado=resultado_final,
            timestamp=datetime.now().isoformat(),
        )

        return response_data

    except HTTPException as e:
        raise e
    except Exception as e:
        # Log do erro para depuração
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro inesperado no endpoint /scan-rapido: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
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
