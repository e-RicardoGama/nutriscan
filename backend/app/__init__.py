# Adicione estas duas linhas no topo para carregar as variáveis de ambiente do .env
from dotenv import load_dotenv
import logging
logger = logging.getLogger(__name__)
load_dotenv()

# Imports necessários
from app.database import engine, Base
# Importe aqui TODOS os seus modelos para que o SQLAlchemy saiba quais tabelas criar.
# Baseado nos seus outros arquivos, os modelos devem ser algo parecido com isto:
from app.models import usuario, alimentos, refeicoes

def init_database():
       # Verifica se o engine está conectado
       with engine.connect() as connection:
           logger.info("Conexão com banco estabelecida.")
       
       Base.metadata.create_all(bind=engine)
       logger.info("Tabelas verificadas/criadas com sucesso!")