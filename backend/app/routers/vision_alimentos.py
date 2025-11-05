# app/routers/vision_alimentos.py
# VERSÃO COMPLETA - SUBSTITUA TODO O ARQUIVO

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import func 
from typing import List, Any, Dict, Optional
from datetime import datetime
import json
import uuid
from google.cloud import storage
import os

# --- Imports Explícitos ---
from app.database import get_db
from app import crud
from app.models.alimentos import Alimento
from app.models.usuario import Usuario 
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.security import get_current_user # Importa o usuário autenticado
from app.crud import (
    create_refeicao_salva,
    get_refeicao_salva, 
    update_refeicao_status,
    get_historico_refeicoes_por_usuario,
    get_detalhe_refeicao_por_id,
    get_consumo_macros_hoje,
    get_refeicoes_hoje_por_usuario
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
    RefeicaoHistoricoItem, # Schema para a lista de histórico
    ResumoDiarioResponse  # Schema para o resumo do dashboard
)

from app.vision import (
    escanear_prato_extrair_alimentos,
    fetch_gemini_nutritional_data,  # <-- A nossa nova função de busca
    gerar_recomendacoes_detalhadas_ia # <-- A nossa nova função de recomendações
)

# ✅✅✅ PREFIXO CORRIGIDO ✅✅✅
router = APIRouter(
    prefix="/refeicoes", # CORRIGIDO: Sem /api/v1
    tags=["Refeições e Análise (Vision)"]
)

# ---------------------------------------------------------------
# ENDPOINT 0: SCAN RÁPIDO (O ENDPOINT QUE FALTAVA)
# ---------------------------------------------------------------
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
@router.post("/salvar-scan-editado", response_model=RefeicaoSalvaIdResponse, summary="Salva scan editado e faz upload da imagem")
async def salvar_scan_rapido_editado(
    # 1. MUDANÇA: Recebe a imagem
    imagem: UploadFile = File(..., description="A imagem original da refeição"),
    
    # 2. MUDANÇA: Recebe o JSON dos alimentos como texto (string)
    alimentos_json: str = Form(..., description="A lista de alimentos editados em formato JSON string"), 
    
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user) 
):
    
    # 3. MUDANÇA: Converter o texto JSON de volta para a lista Python
    try:
        alimentos_data = json.loads(alimentos_json)
        # Valida se os dados estão no formato correto do schema
        alimentos_editados: List[AlimentoSalvoCreate] = [AlimentoSalvoCreate(**alimento) for alimento in alimentos_data]
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato JSON inválido para 'alimentos_json'.")
    except Exception as e: # Pega erros de validação do Pydantic
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro na validação dos dados dos alimentos: {e}")

    if not alimentos_editados:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A lista de alimentos não pode estar vazia.")

    # 4. MUDANÇA: Lógica de Upload para o Google Cloud Storage
    imagem_url_publica = None
    try:
        imagem_bytes = await imagem.read()
        bucket_name = "nutriscan-imagens-prod" # O nome do seu bucket
        
        # Gera um nome de arquivo único para não sobrescrever
        # Formato: refeicoes/IDdoUsuario_UUID.extensao (ex: refeicoes/123_abc123.jpg)
        extensao = imagem.filename.split('.')[-1] if '.' in imagem.filename else 'jpg'
        file_name = f"refeicoes/{current_user.id}_{uuid.uuid4().hex}.{extensao}" 
        
        # --- (A) SE VOCÊ JÁ TEM A FUNÇÃO DE UPLOAD ---
        # (Descomente as linhas abaixo e importe sua função 'upload_to_gcs')
        
        # from app.gcs_utils import upload_to_gcs # <--- Importe sua função
        # imagem_url_publica = upload_to_gcs(
        #     bucket_name=bucket_name,
        #     file_bytes=imagem_bytes,
        #     destination_blob_name=file_name,
        #     content_type=imagem.content_type
        # )

        # --- (B) PARA TESTAR SEM A FUNÇÃO DE UPLOAD (MOCK) ---
        # (Deixe esta linha e comente o bloco acima)
        print(f"--- MODO TESTE: Imagem seria salva em {bucket_name}/{file_name} ---")
        imagem_url_publica = f"https://storage.googleapis.com/{bucket_name}/{file_name}"
        # --- FIM DO MODO TESTE ---

    except Exception as e:
        print(f"Erro ao fazer upload da imagem para GCS: {e}") 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao salvar a imagem.")

    if not imagem_url_publica:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Não foi possível obter a URL da imagem após o upload.")

    # 5. MUDANÇA: Passar a URL da imagem ao criar a refeição
    refeicao_data = RefeicaoSalvaCreate(
        alimentos=alimentos_editados,
        imagem_url=imagem_url_publica # <-- Passando a URL salva!
    )
    
    try:
        db_refeicao = crud.create_refeicao_salva(db=db, refeicao_data=refeicao_data, user_id=current_user.id)
        if not db_refeicao: 
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Não foi possível criar a refeição no banco.")
        
        return RefeicaoSalvaIdResponse(meal_id=db_refeicao.id)
    
    except Exception as e:
        print(f"Erro ao salvar refeição editada user {current_user.id}: {e}") 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao salvar a refeição.")
    

# ==========================================================
# ✅ ENDPOINT DE ANÁLISE DETALHADA (Substituído pela nova lógica)
# ==========================================================
# app/routers/vision_alimentos.py

@router.post("/analisar-detalhadamente/{meal_id}",
             response_model=AnaliseCompletaResponseSchema,
             summary="Analisa refeição salva por ID")
async def analisar_refeicao_detalhadamente_por_id(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # 1. Obter a refeição e os alimentos
    db_refeicao: Optional[RefeicaoSalva] = crud.get_refeicao_salva(db=db, meal_id=meal_id, user_id=current_user.id)
    if not db_refeicao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refeição não encontrada.")
    
    alimentos_salvos: List[AlimentoSalvo] = db_refeicao.alimentos
    if not alimentos_salvos:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refeição sem alimentos.")

    # --- Início da Nova Lógica de Análise ---
    lista_alimentos_para_ia = []  # Lista de dicts para a IA (recomendações)
    detalhes_prato_resposta = []  # Lista de schemas para a resposta

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

            # 3. Chamar a função
            dados_nutricionais_db = fetch_gemini_nutritional_data(
                alimento_nome=alimento_salvo.nome
            )

            # 4. FAZER OS CÁLCULOS EM PYTHON
            ratio = alimento_salvo.quantidade_estimada_g / 100.0

            calorias_item = (dados_nutricionais_db.get("energia_kcal_100g") or 0) * ratio
            proteinas_item = (dados_nutricionais_db.get("proteina_g_100g") or 0) * ratio
            carboidratos_item = (dados_nutricionais_db.get("carboidrato_g_100g") or 0) * ratio
            gorduras_item = (dados_nutricionais_db.get("lipidios_g_100g") or 0) * ratio

            total_calorias += calorias_item
            total_proteinas += proteinas_item
            total_carboidratos += carboidratos_item
            total_gorduras += gorduras_item

            # 5. Preparar listas para a resposta e para a IA
            detalhes_prato_resposta.append(
                AlimentoDetalhado(
                    nome=alimento_salvo.nome,
                    quantidade_gramas=alimento_salvo.quantidade_estimada_g,
                    metodo_preparo="Não especificado",
                    medida_caseira_sugerida=f"{dados_nutricionais_db.get('unidades') or 1} {dados_nutricionais_db.get('un_medida_caseira') or 'g'}"
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
            dados_ia = {}  # Zera para os 'gets' abaixo funcionarem

        # ✅ 7. SEPARAR VITAMINAS E MINERAIS (CORREÇÃO PRINCIPAL)
        vitaminas_minerais_lista = dados_ia.get("vitaminas_minerais", [])
        
        # Listas conhecidas de minerais (em minúsculas para comparação)
        minerais_conhecidos = [
            'cálcio', 'calcio', 'ferro', 'magnésio', 'magnesio', 'fósforo', 'fosforo',
            'potássio', 'potassio', 'sódio', 'sodio', 'selênio', 'selenio', 'zinco',
            'cobre', 'manganês', 'manganes', 'iodo', 'iodeto'
        ]

        vitaminas_separadas = []
        minerais_separados = []

        for item in vitaminas_minerais_lista:
            texto_lower = item.lower()
            
            # Se contém "vitamina" ou começa com "vit" => é vitamina
            if 'vitamina' in texto_lower or texto_lower.startswith('vit'):
                vitaminas_separadas.append(item)
            # Se é um mineral conhecido => é mineral
            elif any(mineral in texto_lower for mineral in minerais_conhecidos):
                minerais_separados.append(item)
            # Fallback: se for curto e sem espaço, provavelmente é mineral
            elif len(texto_lower) <= 12 and ' ' not in texto_lower:
                minerais_separados.append(item)
            # Caso contrário, joga em vitaminas
            else:
                vitaminas_separadas.append(item)

        print(f"DEBUG - Vitaminas separadas: {vitaminas_separadas}")
        print(f"DEBUG - Minerais separados: {minerais_separados}")

        # 8. Montar e retornar a resposta final COM VITAMINAS E MINERAIS SEPARADOS
        resultado_analise = AnaliseCompletaResponseSchema(
            detalhes_prato=DetalhesPrato(
                alimentos=detalhes_prato_resposta
            ),
            analise_nutricional=AnaliseNutricional(
                calorias_totais=round(total_calorias),
                macronutrientes=Macronutrientes(
                    proteinas_g=round(total_proteinas, 1),
                    carboidratos_g=round(total_carboidratos, 1),
                    gorduras_g=round(total_gorduras, 1)
                ),
                # ✅ CORREÇÃO: Passar as listas separadas
                vitaminas=vitaminas_separadas if vitaminas_separadas else None,
                minerais=minerais_separados if minerais_separados else None
            ),
            recomendacoes=Recomendacoes(
                pontos_positivos=dados_ia.get("recomendacoes", {}).get("pontos_positivos", ["Análise concluída."]),
                sugestoes_balanceamento=dados_ia.get("recomendacoes", {}).get("sugestoes_balanceamento", ["Não foi possível gerar sugestões."]),
                alternativas_saudaveis=dados_ia.get("recomendacoes", {}).get("alternativas_saudaveis", [])
            )
        )

        # 9. Salvar o resultado da análise no banco
        try:
            analysis_dict = resultado_analise.dict() if hasattr(resultado_analise, 'dict') else resultado_analise.model_dump()
            db_refeicao.analysis_result_json = json.dumps(analysis_dict, ensure_ascii=False)
            db.commit()
        except Exception as e:
            print(f"Erro ao salvar análise no banco: {e}")

        # Atualizar o status
        crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_COMPLETE)
        return resultado_analise

    except Exception as e:
        print(f"Erro análise detalhada refeição {meal_id} user {current_user.id}: {e}")
        try:
            crud.update_refeicao_status(db=db, db_refeicao=db_refeicao, status=RefeicaoStatus.ANALYSIS_FAILED)
        except Exception as db_e:
            print(f"Erro ao atualizar status FALHA refeição {meal_id}: {db_e}")
        if isinstance(e, HTTPException):
            raise e
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao realizar a análise detalhada: {e}")

# ---------------------------------------------------------------
# ENDPOINT 3: GET HISTÓRICO (Para a página /historico)
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
# ENDPOINT 4: GET DETALHE (Para a página /refeicao/[id])
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
        print(f"Erro ao carregar JSON da análise: {e}")
        raise HTTPException(status_code=500, detail="Erro ao ler dados da análise salva.")

# ---------------------------------------------------------------
# ENDPOINT 5: GET RESUMO DIÁRIO (Para o Dashboard)
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
# ENDPOINT 6: GET LISTA DE REFEIÇÕES DE HOJE (Para o Dashboard)
# ---------------------------------------------------------------
@router.get(
    "/refeicoes-hoje", 
    response_model=List[RefeicaoHistoricoItem],
    summary="Lista as refeições (resumo) do usuário para hoje"
)
def get_refeicoes_hoje(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    refeicoes_db = crud.get_refeicoes_hoje_por_usuario(db, user_id=current_user.id)
    resultado_lista = []

    for refeicao in refeicoes_db:
        total_calorias = None
        if refeicao.analysis_result_json:
            try:
                analise_data = json.loads(refeicao.analysis_result_json)
                total_calorias = analise_data.get("analise_nutricional", {}).get("calorias_totais")
            except:
                pass 

        resultado_lista.append(
            RefeicaoHistoricoItem(
                id=refeicao.id,
                data_criacao=refeicao.created_at,
                imagem_url=refeicao.imagem_url,
                total_calorias=total_calorias
            )
        )
    return resultado_lista