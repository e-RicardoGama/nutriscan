# app/routers/vision_alimentos.py - Imports Explícitos Corrigidos

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from typing import List, Any, Dict,Optional # Adicionado Dict
from datetime import datetime
import asyncio 

# --- Imports Explícitos ---
from app.database import get_db
from app import crud # Importa o módulo crud
# Importa modelos específicos necessários
from app.models.usuario import Usuario 
from app.models.refeicoes import RefeicaoSalva # Necessário para tipar db_refeicao
# Importa schemas específicos
from app.schemas.vision_alimentos_ import ( 
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema, 
    AlimentoSalvoCreate,
    RefeicaoSalvaIdResponse,
    RefeicaoStatus, 
    ScanRapidoResponse,
    RefeicaoSalvaCreate,
    AlimentoDetalhado, 
    DetalhesPrato,      
    AnaliseNutricional, 
    Macronutrientes,    
    Recomendacoes       
)
from app.security import get_current_user 
from app.vision import (
    analisar_imagem_do_prato_detalhado,  
    escanear_prato_extrair_alimentos, 
    analisar_lista_alimentos_detalhadamente 
)
# --- Fim Imports ---

router = APIRouter(
    prefix="/refeicoes", 
    tags=["Refeições e Análise de Visão"]
)

# --- Endpoint de Scan Rápido ---
@router.post("/scan-rapido", response_model=ScanRapidoResponse, summary="Realiza scan rápido") 
async def scan_rapido(
    imagem: UploadFile = File(...),
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user) 
):
    if not imagem.content_type.startswith('image/'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo deve ser uma imagem")
    try:
        imagem_bytes = await imagem.read()
        resultado_scan = escanear_prato_extrair_alimentos(imagem_bytes) 
        if not isinstance(resultado_scan, dict):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Formato inesperado da análise de scan.")
        if "erro" in resultado_scan:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=resultado_scan["erro"])
        return ScanRapidoResponse(
            status="sucesso", 
            modalidade="scan_rapido",
            resultado=resultado_scan, 
            timestamp=datetime.now().isoformat()
        )
    except HTTPException: raise
    except Exception as e:
        print(f"Erro no endpoint /scan-rapido: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro no scan: consulte os logs.")


# --- Endpoint para Salvar Scan Editado ---
@router.post("/salvar-scan-editado", response_model=RefeicaoSalvaIdResponse, summary="Salva scan editado")
async def salvar_scan_rapido_editado(
    alimentos_editados: List[AlimentoSalvoCreate], 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user) 
):
    if not alimentos_editados:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A lista de alimentos não pode estar vazia.")
    refeicao_data = RefeicaoSalvaCreate(alimentos=alimentos_editados)
    try:
        # Chama crud.create_refeicao_salva
        db_refeicao = crud.create_refeicao_salva(db=db, refeicao_data=refeicao_data, user_id=current_user.id)
        if not db_refeicao: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Não foi possível criar a refeição.")
        return RefeicaoSalvaIdResponse(meal_id=db_refeicao.id)
    except Exception as e:
        print(f"Erro ao salvar refeição editada user {current_user.id}: {e}") 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao salvar a refeição.")


# --- Endpoint de Análise Detalhada POR ID ---
@router.post("/analisar-detalhadamente/{meal_id}", 
             response_model=AnaliseCompletaResponseSchema, 
             summary="Analisa refeição salva por ID") 
async def analisar_refeicao_detalhadamente_por_id(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user) 
):
    # Chama crud.get_refeicao_salva
    db_refeicao: Optional[RefeicaoSalva] = crud.get_refeicao_salva(db=db, meal_id=meal_id, user_id=current_user.id) # Tipagem explícita
    if not db_refeicao: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refeição não encontrada.")
    if not db_refeicao.alimentos: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refeição sem alimentos.")

    lista_alimentos_para_analise: List[Dict[str, Any]] = [ 
        { "nome": al.nome, "quantidade_gramas": al.quantidade_estimada_g } 
        for al in db_refeicao.alimentos if al.quantidade_estimada_g is not None
    ]
    if not lista_alimentos_para_analise:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum alimento com quantidade estimada encontrado.")

    try:
        print(f"-> Chamando análise detalhada da LISTA para refeição {meal_id}...")
        resultado_dict = analisar_lista_alimentos_detalhadamente(lista_alimentos_para_analise) 
        
        if not isinstance(resultado_dict, dict):
             print(f"Erro: Análise da lista retornou tipo inesperado: {type(resultado_dict)}")
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno na análise da lista.")
        if "erro" in resultado_dict:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=resultado_dict["erro"])

        try:
            resultado_analise = AnaliseCompletaResponseSchema.model_validate(resultado_dict) # Pydantic V2
        except Exception as pydantic_error:
            print(f"Erro de validação Pydantic (refeição {meal_id}): {pydantic_error}")
            print(f"Dados da IA que falharam: {resultado_dict}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao formatar resposta da análise.")

        # Chama crud.update_refeicao_status
        crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_COMPLETE)
        
        return resultado_analise

    except Exception as e:
        print(f"Erro análise detalhada refeição {meal_id} user {current_user.id}: {e}")
        try: 
            # Chama crud.update_refeicao_status
            crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_FAILED)
        except Exception as db_e:
             print(f"Erro ao atualizar status FALHA refeição {meal_id}: {db_e}")
        if isinstance(e, HTTPException): raise e
        else: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao realizar a análise detalhada.")


# --- Endpoint de Análise Detalhada DIRETO DA IMAGEM (Opcional) ---
#@router.post("/analisar-imagem-detalhado", response_model=AnaliseCompletaResponseSchema, summary="[Alternativo] Analisa imagem direto", deprecated=True) 
#async def analisar_imagem_detalhada_direto(
#    file: UploadFile = File(...),
#    db: Session = Depends(get_db), 
#    current_user: Usuario = Depends(get_current_user) 
#):
#    if not file.content_type.startswith("image/"): raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo inválido.")
#    try:
#        conteudo_imagem = await file.read()
#        resultado = analisar_imagem_do_prato_detalhado(conteudo_imagem) 
#        if not isinstance(resultado, dict): raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Formato inesperado da análise de imagem.")
#        if "erro" in resultado: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=resultado["erro"])
#        validated_result = AnaliseCompletaResponseSchema.model_validate(resultado) 
#        return validated_result 
#    except HTTPException: raise
#    except Exception as e:
#        print(f"Erro endpoint /analisar-imagem-detalhado: {str(e)}")
#        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno: consulte logs.")

