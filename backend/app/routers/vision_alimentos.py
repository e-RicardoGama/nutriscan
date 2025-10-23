# app/routers/vision_alimentos.py - VERSÃO CORRIGIDA (Fluxo Scan -> Lista -> Análise IA)

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.alimentos import Alimento
from app.services import refeicao_service

# Schemas necessários para este router
from app.schemas.vision_alimentos_ import (
    AlimentoPublic, 
    AnaliseCompletaResponse, # Usado como response_model
)

# Funções da IA que este router utiliza
from app.vision import (
    analisar_imagem_do_prato_detalhado, 
    obter_nutrientes_do_gemini, 
    escanear_prato_extrair_alimentos,
    gerar_analise_detalhada_da_lista  # <-- Função chave para este fluxo
)

router = APIRouter(
    prefix="/refeicoes", 
    tags=["Refeições e Análise de Visão"]
)

# Este endpoint continua como estava, chamando a análise direto da imagem
@router.post("/analisar-imagem-detalhado", 
              response_model=AnaliseCompletaResponse, 
              summary="Analisa imagem detalhadamente")
async def analisar_imagem_detalhada(file: UploadFile = File(...)):
    try:
        conteudo_imagem = await file.read()
        resultado = analisar_imagem_do_prato_detalhado(conteudo_imagem)
        if isinstance(resultado, dict) and "erro" in resultado:
            raise HTTPException(status_code=500, detail=resultado["erro"])
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no endpoint /analisar-imagem-detalhado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno no servidor: {str(e)}")

# Este endpoint continua como estava, para o Scan Rápido
@router.post("/scan-rapido")
async def scan_rapido(imagem: UploadFile = File(...)):
    if not imagem.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
    
    try:
        imagem_bytes = await imagem.read()
        resultado = escanear_prato_extrair_alimentos(imagem_bytes)
        
        if isinstance(resultado, dict) and "erro" in resultado:
            raise HTTPException(status_code=500, detail=resultado["erro"])

        return {
            "status": "sucesso", 
            "modalidade": "scan_rapido",
            "resultado": resultado,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no endpoint /scan-rapido: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro no scan: {str(e)}")
    
