# app/routers/vision_alimentos.py

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.alimentos import Alimento
# Importe o schema correto para o response_model
from app.schemas.vision_alimentos import AlimentoPublic, AnaliseCompletaResponse,AnaliseCompletaListaResponse, AnaliseListaPayload,AlimentoDetalhadoResponse,AnaliseNutricionalResponse,MacronutrientesResponse,RecomendacoesResponse
from app.services import refeicao_service
from app.vision import analisar_imagem_do_prato_detalhado, obter_nutrientes_do_gemini, escanear_prato_extrair_alimentos

#router = APIRouter(prefix="/api", tags=["vision", "alimentos"])

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

# ADICIONADO `response_model` PARA GARANTIR A VALIDAÇÃO CORRETA DA RESPOSTA
@router.post("/analisar-imagem-detalhado", 
             response_model=AnaliseCompletaResponse, 
             summary="Analisa imagem detalhadamente")
async def analisar_imagem_detalhada(file: UploadFile = File(...)):
    try:
        conteudo_imagem = await file.read()
        resultado = analisar_imagem_do_prato_detalhado(conteudo_imagem)
        if isinstance(resultado, dict) and "erro" in resultado:
            raise HTTPException(status_code=500, detail=resultado["erro"])
        # FastAPI validará o dicionário 'resultado' contra o schema 'AnaliseCompletaResponse'
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno no servidor: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Erro no scan: {str(e)}")
    
@router.post(
    "/analisar-lista-detalhada", 
    response_model=AnaliseCompletaListaResponse # Define o modelo de resposta
)
async def analisar_lista_detalhada(
    payload: AnaliseListaPayload,
    # current_user: Usuario = Depends(get_current_user) # Se precisar de autenticação
):
    """
    Recebe uma lista de alimentos (nome, gramas) e retorna a análise nutricional detalhada.
    """
    print(f"Recebido payload para /analisar-lista-detalhada: {payload.alimentos}") # Log para depuração

    if not payload.alimentos:
        raise HTTPException(status_code=400, detail="A lista de alimentos não pode estar vazia.")

    try:
        # --- SUA LÓGICA PRINCIPAL AQUI ---
        # 1. Chame sua função/serviço que calcula os nutrientes a partir da lista
        #    Exemplo: 
        #    resultado_analise = await calcula_nutrientes_e_recomendacoes(payload.alimentos)
        
        # --- DADOS DE EXEMPLO (SUBSTITUA PELA SUA LÓGICA REAL) ---
        # Simula o cálculo e formatação da resposta
        total_calorias_simulado = sum(a.quantidade_gramas * 1.5 for a in payload.alimentos) # Exemplo simples
        resultado_analise = AnaliseCompletaListaResponse(
            detalhes_prato={"alimentos": [
                AlimentoDetalhadoResponse(nome=a.nome, quantidade_gramas=a.quantidade_gramas) for a in payload.alimentos
            ]},
            analise_nutricional=AnaliseNutricionalResponse(
                calorias_totais=total_calorias_simulado,
                macronutrientes=MacronutrientesResponse(proteinas_g=total_calorias_simulado/8, carboidratos_g=total_calorias_simulado/5, gorduras_g=total_calorias_simulado/15),
                vitaminas_minerais=["Exemplo Vit A", "Exemplo Ferro"]
            ),
            recomendacoes=RecomendacoesResponse(
                pontos_positivos=["Exemplo: Bom teor de proteína."],
                sugestoes_balanceamento=["Exemplo: Adicionar mais vegetais."],
                alternativas_saudaveis=[]
            ),
            timestamp="2025-10-22T..." # Opcional
        )
        # --- FIM DOS DADOS DE EXEMPLO ---

        print(f"Retornando análise: {resultado_analise}") # Log para depuração
        return resultado_analise

    except Exception as e:
        # Log detalhado do erro no servidor
        print(f"❌ Erro inesperado em /analisar-lista-detalhada: {e}") 
        # Mensagem de erro clara para o frontend
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno ao processar a análise da lista: {str(e)}" 
        )