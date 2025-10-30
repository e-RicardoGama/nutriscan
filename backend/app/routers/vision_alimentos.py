# app/routers/vision_alimentos.py - VERSÃO FINAL COM LÓGICA DE AUTO-APRENDIZAGEM

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import func # ✅ ADICIONADO para busca case-insensitive
from typing import List, Any, Dict, Optional
from datetime import datetime
import asyncio 

# --- Imports Explícitos (Mantendo os seus padrões) ---
from app.database import get_db
from app import crud
from app import models # ✅ ADICIONADO para aceder a models.Alimento
from app.models.usuario import Usuario 
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo
from app.models.alimentos import Alimento 
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

# --- ✅ NOVOS IMPORTS DO VISION.PY ---
# Importamos as 3 funções que definimos no nosso ficheiro vision.py
from app.vision import (
    escanear_prato_extrair_alimentos,
    fetch_gemini_nutritional_data,  # <-- A nossa nova função de busca
    gerar_recomendacoes_detalhadas_ia # <-- A nossa nova função de recomendações
)
# --- Fim Imports ---

router = APIRouter(
    prefix="/refeicoes", 
    tags=["Refeições e Análise de Visão"]
)

# ==========================================================
# ✅ FUNÇÃO DE "AUTO-APRENDIZAGEM" (Vive aqui, pois usa DB)
# ==========================================================
def get_or_create_nutritional_data(db: Session, alimento_nome: str) -> models.Alimento:
    """
    Procura um alimento no DB (case-insensitive). 
    Se não encontrar, chama o 'vision.py' para obter os dados do Gemini e salva no DB.
    """
    
    # 1. Tenta encontrar no DB
    alimento_db = db.query(models.Alimento).filter(
        func.lower(models.Alimento.alimento) == func.lower(alimento_nome)
    ).first()
    
    if alimento_db:
        print(f"INFO: Alimento '{alimento_nome}' encontrado no DB (ID: {alimento_db.id}).")
        return alimento_db

    # 2. NÃO ENCONTROU? Chame o Gemini (via vision.py)
    print(f"INFO: Alimento '{alimento_nome}' não encontrado no DB. A consultar o Gemini...")
    
    try:
        # Chama a função pura do vision.py
        dados_nutricionais = fetch_gemini_nutritional_data(alimento_nome)
        
        if "erro" in dados_nutricionais:
             raise Exception(f"Erro do Gemini ao buscar dados: {dados_nutricionais['erro']}")

        # 3. Salvar o novo alimento no DB
        print(f"INFO: Gemini respondeu. A salvar '{alimento_nome}' no DB...")
        
        # (Ajuste os campos 'default' conforme o seu models.Alimento)
        novo_alimento_db = models.Alimento(
            alimento=dados_nutricionais.get("alimento", alimento_nome),
            energia_kcal_100g=float(dados_nutricionais.get("energia_kcal_100g", 0)),
            proteina_g_100g=float(dados_nutricionais.get("proteina_g_100g", 0)),
            carboidrato_g_100g=float(dados_nutricionais.get("carboidrato_g_100g", 0)),
            lipidios_g_100g=float(dados_nutricionais.get("lipidios_g_100g", 0)),
            fibra_g_100g=float(dados_nutricionais.get("fibra_g_100g", 0)),
            unidades=float(dados_nutricionais.get("unidades", 1)),
            un_medida_caseira=dados_nutricionais.get("un_medida_caseira", "g"),
            peso_aproximado_g=float(dados_nutricionais.get("peso_aproximado_g", 100)),
            
            # Definir valores padrão (ajuste conforme o seu models.py)
            categoria="Auto-Gerado (IA)", 
            alimento_normalizado=alimento_nome.lower().replace(" ", "_"),
            status="auto_generated", # (Use o seu valor 'status' padrão, ex: "in_natura")
            dieta="balanceada", 
            refeicao="almoco,jantar",
        )
        
        db.add(novo_alimento_db)
        db.commit()
        db.refresh(novo_alimento_db)
        
        print(f"INFO: Novo alimento salvo com ID: {novo_alimento_db.id}")
        return novo_alimento_db

    except Exception as e:
        print(f"ERRO: Falha ao consultar o Gemini ou salvar no DB: {e}")
        db.rollback()
        # Retorna um "Alimento Vazio" para não quebrar a análise
        return models.Alimento(
             alimento=alimento_nome, energia_kcal_100g=0, proteina_g_100g=0, 
             carboidrato_g_100g=0, lipidios_g_100g=0, unidades=1, 
             un_medida_caseira="g", peso_aproximado_g=100, 
             categoria="Desconhecido", status="auto_generated_failed"
         )


# --- Endpoint de Scan Rápido (O seu código original, sem alterações) ---
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


# --- Endpoint para Salvar Scan Editado (O seu código original, sem alterações) ---
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
        db_refeicao = crud.create_refeicao_salva(db=db, refeicao_data=refeicao_data, user_id=current_user.id)
        if not db_refeicao: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Não foi possível criar a refeição.")
        return RefeicaoSalvaIdResponse(meal_id=db_refeicao.id)
    except Exception as e:
        print(f"Erro ao salvar refeição editada user {current_user.id}: {e}") 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao salvar a refeição.")


# ==========================================================
# ✅ ENDPOINT DE ANÁLISE DETALHADA (Substituído pela nova lógica)
# ==========================================================
@router.post("/analisar-detalhadamente/{meal_id}", 
             response_model=AnaliseCompletaResponseSchema, 
             summary="Analisa refeição salva por ID") 
async def analisar_refeicao_detalhadamente_por_id(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user) 
):
    
    # 1. Obter a refeição e os alimentos (O seu código original)
    db_refeicao: Optional[RefeicaoSalva] = crud.get_refeicao_salva(db=db, meal_id=meal_id, user_id=current_user.id)
    if not db_refeicao: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refeição não encontrada.")
    
    alimentos_salvos: List[AlimentoSalvo] = db_refeicao.alimentos
    if not alimentos_salvos: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refeição sem alimentos.")

    # --- Início da Nova Lógica de Análise ---
    
    lista_alimentos_para_ia = [] # Lista de dicts para a IA (recomendações)
    detalhes_prato_resposta = [] # Lista de schemas para a resposta
    
    total_calorias = 0.0
    total_proteinas = 0.0
    total_carboidratos = 0.0
    total_gorduras = 0.0
    
    print(f"--- Iniciando Análise Detalhada (com Auto-Aprendizagem) para Refeição ID: {meal_id} ---")
            
    try:
        # 2. Loop por cada alimento salvo
        for alimento_salvo in alimentos_salvos:
            if alimento_salvo.quantidade_estimada_g is None or alimento_salvo.quantidade_estimada_g <= 0:
                print(f"Aviso: Pulando alimento '{alimento_salvo.nome}' por não ter quantidade.")
                continue 
        
            # 3. CHAMAR A FUNÇÃO "INTELIGENTE"
            # Esta função é síncrona (def), o FastAPI (async def)
            # irá executá-la num thread pool para não bloquear.
            dados_nutricionais_db = get_or_create_nutritional_data(
                db=db, 
                alimento_nome=alimento_salvo.nome
            )
            
            # 4. FAZER OS CÁLCULOS EM PYTHON
            ratio = alimento_salvo.quantidade_estimada_g / 100.0
            
            calorias_item = (dados_nutricionais_db.energia_kcal_100g or 0) * ratio
            proteinas_item = (dados_nutricionais_db.proteina_g_100g or 0) * ratio
            carboidratos_item = (dados_nutricionais_db.carboidrato_g_100g or 0) * ratio
            gorduras_item = (dados_nutricionais_db.lipidios_g_100g or 0) * ratio
            
            total_calorias += calorias_item
            total_proteinas += proteinas_item
            total_carboidratos += carboidratos_item
            total_gorduras += gorduras_item
            
            # 5. Preparar listas para a resposta e para a IA
            detalhes_prato_resposta.append(
                AlimentoDetalhado( # Use o seu Schema
                    nome=alimento_salvo.nome,
                    quantidade_gramas=alimento_salvo.quantidade_estimada_g,
                    metodo_preparo="Não especificado", 
                    medida_caseira_sugerida=f"{dados_nutricionais_db.unidades or 1} {dados_nutricionais_db.un_medida_caseira or 'g'}"
                )
            )
            lista_alimentos_para_ia.append({
                "nome": alimento_salvo.nome,
                "quantidade_gramas": alimento_salvo.quantidade_estimada_g
            })
        
        if not lista_alimentos_para_ia:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum alimento com quantidade válida encontrado.")

        print(f"--- Fim dos Cálculos. Total Kcal: {total_calorias} ---")
        
        # 6. CHAMAR A IA APENAS PARA RECOMENDAÇÕES
        totais_calculados = {
            "kcal": total_calorias,
            "protein": total_proteinas,
            "carbs": total_carboidratos,
            "fats": total_gorduras
        }
        
        # Chama a função síncrona do vision.py
        dados_ia = gerar_recomendacoes_detalhadas_ia(
            lista_alimentos=lista_alimentos_para_ia,
            totais=totais_calculados
        )

        if "erro" in dados_ia:
             print(f"AVISO: Falha ao gerar recomendações da IA: {dados_ia['erro']}")
             dados_ia = {} # Zera para os 'gets' abaixo funcionarem

        # 7. Montar e retornar a resposta final (usando seus Schemas)
        
        resultado_analise = AnaliseCompletaResponseSchema(
            detalhes_prato=DetalhesPrato( # Use o seu Schema
                alimentos=detalhes_prato_resposta
            ),
            analise_nutricional=AnaliseNutricional(
                calorias_totais=round(total_calorias),
                macronutrientes=Macronutrientes(
                    proteinas_g=round(total_proteinas, 1),
                    carboidratos_g=round(total_carboidratos, 1),
                    gorduras_g=round(total_gorduras, 1)
                ),
                vitaminas_minerais=dados_ia.get("vitaminas_minerais", ["N/A"]) 
            ),
            recomendacoes=Recomendacoes.model_validate(dados_ia.get("recomendacoes", { # Use o seu Schema
                "pontos_positivos": ["Análise concluída."],
                "sugestoes_balanceamento": ["Não foi possível gerar sugestões."],
                "alternativas_saudaveis": []
            }))
        )
        
        # 8. Atualizar o status e retornar (o seu código original)
        crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_COMPLETE)
        return resultado_analise
    
    except Exception as e:
        # O seu bloco de 'except' original está ótimo
        print(f"Erro análise detalhada refeição {meal_id} user {current_user.id}: {e}")
        try: 
            crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_FAILED)
        except Exception as db_e:
            print(f"Erro ao atualizar status FALHA refeição {meal_id}: {db_e}")
        if isinstance(e, HTTPException): raise e
        else: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao realizar a análise detalhada: {e}")