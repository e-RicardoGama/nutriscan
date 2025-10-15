# importar_dados.py - VERSÃO FINALMENTE CORRIGIDA

import pandas as pd
from app.database import SessionLocal

# --- AJUSTE PRINCIPAL AQUI ---
# Importa a classe 'alimentos' de dentro do arquivo 'app/models/alimentos.py'
from app.models.alimentos import Alimento

def importar_dados_taco():
    print("-> Iniciando o script de importação de dados...")
    
    mapeamento_colunas = {
        'categoria': 'categoria', 'alimento_normalizado': 'alimento_normalizado',
        'alimentos': 'alimentos','alimento': 'alimento', 'un_medida_caseira': 'un_medida_caseira',
        'unidades':'unidades', 'peso_aproximado_g': 'peso_aproximado_g', 'energia_kcal_100g': 'energia_kcal_100g',
        'proteina_g_100g': 'proteina_g_100g', 'lipidios_g_100g': 'lipidios_g_100g',
        'colesterol_mg_100g': 'colesterol_mg_100g', 'carboidrato_g_100g': 'carboidrato_g_100g',
        'fibra_g_100g': 'fibra_g_100g', 'calcio_mg_100g': 'calcio_mg_100g',
        'magnesio_mg_100g': 'magnesio_mg_100g', 'ferro_mg_100g': 'ferro_mg_100g',
        'sodio_mg_100g': 'sodio_mg_100g', 'potassio_mg_100g': 'potassio_mg_100g',
        'ac_graxos_saturados_g': 'ac_graxos_saturados_g', 'ac_graxos_monoinsaturados_g': 'ac_graxos_monoinsaturados_g',
        'ac_graxos_poliinsaturados_g': 'ac_graxos_poliinsaturados_g','dieta':'dieta','refeicao':'refeicao','status':'status'
    }

    db = None # Inicializa db como None
    try:
        print("-> Lendo o arquivo taco_nutrientes.csv...")
        df = pd.read_csv('taco.csv').rename(columns=mapeamento_colunas)
        
        db = SessionLocal()
        print("-> Conexão com o banco de dados estabelecida.")
        
        total_linhas = len(df)
        novos_alimentos_count = 0
        print(f"-> Verificando e inserindo {total_linhas} alimentos. Isso pode levar um momento...")

        for index, row in df.iterrows():
            alimento_norm = row.get('alimento_normalizado')
            
            # Usa a classe 'alimentos' (minúsculo) importada
            existe = db.query(Alimento).filter(Alimento.alimento_normalizado == alimento_norm).first()
            
            if not existe:
                dados_alimento = {col: row.get(col) for col in mapeamento_colunas.values()}
                for key, value in dados_alimento.items():
                    if pd.isna(value):
                        dados_alimento[key] = None
                
                # Usa a classe 'alimentos' (minúsculo) importada
                novo_alimento_obj = Alimento(**dados_alimento)
                db.add(novo_alimento_obj)
                novos_alimentos_count += 1

        if novos_alimentos_count > 0:
            print(f"-> {novos_alimentos_count} novos alimentos para adicionar. Commitando no banco de dados...")
            db.commit()
            print(f"✅ Sucesso! {novos_alimentos_count} alimentos foram adicionados à tabela.")
        else:
            print("ℹ️ Nenhum alimento novo para adicionar. A tabela já está atualizada.")

    except FileNotFoundError:
        print("❌ ERRO: O arquivo 'taco_nutrientes.csv' não foi encontrado.")
    except ImportError:
        print("❌ ERRO DE IMPORTAÇÃO: Verifique a linha 'from app.models.alimentos import alimentos'.")
        print("   Certifique-se que o nome da classe e do arquivo estão corretos.")
    except Exception as e:
        print(f"❌ Ocorreu um erro inesperado: {e}")
        if db:
            db.rollback()
    finally:
        if db:
            db.close()
            print("-> Conexão com o banco de dados fechada.")

if __name__ == "__main__":
    importar_dados_taco()