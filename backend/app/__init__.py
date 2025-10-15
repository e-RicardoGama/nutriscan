# Adicione estas duas linhas no topo para carregar as variáveis de ambiente do .env
from dotenv import load_dotenv
load_dotenv()

# Imports necessários
from app.database import engine, Base
# Importe aqui TODOS os seus modelos para que o SQLAlchemy saiba quais tabelas criar.
# Baseado nos seus outros arquivos, os modelos devem ser algo parecido com isto:
from app.models import usuario, alimentos

def init_database():
    """
    Função para criar todas as tabelas no banco de dados.
    """
    print("Iniciando a criação das tabelas no banco de dados...")
    try:
        # O comando create_all() inspeciona todos os modelos que herdam de Base
        # e cria as tabelas correspondentes se elas ainda não existirem.
        Base.metadata.create_all(bind=engine)
        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Ocorreu um erro ao criar as tabelas: {e}")

if __name__ == "__main__":
    init_database()