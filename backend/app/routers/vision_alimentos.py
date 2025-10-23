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
    AnaliseListaPayload      # Usado como payload de entrada
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

@router.get("/alimentos/buscar-por-nome", response_model=AlimentoPublic, summary="Busca a melhor correspondência para um nome de alimento")
def buscar_alimento_especifico(nome: str, db: Session = Depends(get_db)):
    if not nome:
        raise HTTPException(status_code=400, detail="O nome do alimento não pode ser vazio.")
    alimento_encontrado = refeicao_service._buscar_melhor_correspondencia(db, nome)
    if not alimento_encontrado:
        raise HTTPException(status_code=404, detail=f"Nenhum alimento correspondente a '{nome}' foi encontrado.")
    return alimento_encontrado

@router.get("/nutrientes/sugerir", summary="Sugere nutrientes para um alimento usando IA")
def sugerir_nutrientes(nome_alimento: str):
    if not nome_alimento:
        raise HTTPException(status_code=400, detail="O nome do alimento é obrigatório.")
    nutrientes_sugeridos = obter_nutrientes_do_gemini(nome_alimento)
    if not nutrientes_sugeridos:
        raise HTTPException(status_code=404, detail="A IA não conseguiu encontrar nutrientes para este alimento.")
    return nutrientes_sugeridos

@router.get("/", summary="Endpoint Raiz", description="Retorna uma mensagem de boas-vindas.")
def raiz():
    return {"mensagem": "Bem-vindo à API do AppNutri!"}

@router.get("/alimentos/buscar", response_model=List[AlimentoPublic], summary="Busca manual de alimentos")
def buscar_alimentos(q: str, db: Session = Depends(get_db)):
    if not q or len(q) < 3:
        raise HTTPException(status_code=400, detail="O parâmetro 'q' deve ter no mínimo 3 caracteres.")
    resultados = db.query(Alimento).filter(Alimento.alimento.ilike(f"%{q}%")).limit(20).all()
    if not resultados:
        raise HTTPException(status_code=404, detail="Nenhum alimento encontrado.")
    return resultados

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
    
# ✅ ENDPOINT CORRIGIDO PARA O FLUXO DESEJADO (Scan -> Lista Editada -> Análise IA)
@router.post(
    "/analisar-lista-detalhada", 
    response_model=AnaliseCompletaResponse # Garante que a resposta da IA tenha o formato esperado
)
async def analisar_lista_detalhada(
    payload: AnaliseListaPayload,
):
    """
    Recebe uma lista de alimentos (nome, gramas), chama a IA para gerar a 
    análise nutricional detalhada completa (incluindo vitaminas e recomendações) 
    e retorna o resultado.
    """
    print(f"Recebido payload para /analisar-lista-detalhada: {payload.alimentos}") 

    if not payload.alimentos:
        raise HTTPException(status_code=400, detail="A lista de alimentos não pode estar vazia.")

    try:
        # --- LÓGICA CORRIGIDA ---
        # 1. Converte o payload Pydantic para um dicionário Python
        #    Use .model_dump() para Pydantic V2+ ou .dict() para V1
        try:
             payload_dict = payload.model_dump() 
        except AttributeError:
             payload_dict = payload.dict() # Fallback para Pydantic V1

        # 2. Chama a função da IA que processa a lista e pede a análise completa
        resultado_analise = gerar_analise_detalhada_da_lista(payload_dict)
        
        # 3. Verifica se a IA retornou um erro interno
        if isinstance(resultado_analise, dict) and "erro" in resultado_analise:
            # Não lança exceção se for apenas um erro de parseamento JSON, 
            # pois o response_model vai pegar isso. Lança para erros da API Gemini.
            if "JSON" not in resultado_analise["erro"]:
                 raise HTTPException(status_code=500, detail=resultado_analise["erro"])
            # Se for erro de JSON, deixa o Pydantic validar e retornar 422 se necessário
        
        # 4. Retorna o dicionário JSON. O FastAPI/Pydantic vai validar
        #    automaticamente contra o 'response_model=AnaliseCompletaResponse'.
        #    Se a IA não retornar o formato EXATO, o Pydantic gerará um erro 422.
        print(f"Retornando análise da IA: {resultado_analise}") 
        return resultado_analise
        # --- FIM DA LÓGICA CORRIGIDA ---

    except HTTPException:
        # Repassa exceções HTTP que já foram tratadas (como o erro 400)
        raise
    except Exception as e:
        # Captura qualquer outro erro inesperado
        print(f"❌ Erro inesperado em /analisar-lista-detalhada: {e}") 
        import traceback
        traceback.print_exc() # Imprime o stack trace completo no log do servidor
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno ao processar a análise da lista: {str(e)}" 
        )