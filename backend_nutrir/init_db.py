# init_db.py - VERSÃO CORRIGIDA

from sqlalchemy import inspect
from app.database import engine, Base

# Importe TODOS os seus modelos aqui.
# Isso garante que eles sejam registrados na metadata da Base.
from app.models import alimentos, usuario
def main():
    print("-> Conectando ao banco de dados para verificar tabelas...")
    inspector = inspect(engine)
    tabelas_existentes = inspector.get_table_names()
    print(f"Tabelas encontradas antes da execução: {tabelas_existentes}")

    print("\n-> Garantindo que todos os modelos sejam registrados...")
    # A linha 'from app.models...' acima já fez o trabalho!
    
    print("-> Executando a criação de novas tabelas (se necessário)...")
    # Agora chamamos o create_all diretamente na Base importada
    Base.metadata.create_all(bind=engine)
    
    print("-> Processo finalizado.")
    
    # Verifica novamente para confirmar a criação
    tabelas_depois = inspect(engine).get_table_names()
    print(f"Tabelas encontradas após a execução: {tabelas_depois}")
    
    if 'alimentos' in tabelas_depois and 'alimentos' not in tabelas_existentes:
        print("\n✅ Sucesso! A tabela 'alimentos' foi criada.")
    elif 'alimentos' in tabelas_existentes:
        print("\nℹ️ A tabela 'alimentos' já existia no banco de dados.")
    else:
        print("\n❌ Falha! A tabela 'alimentos' não foi criada. Verifique os logs.")

if __name__ == "__main__":
    main()