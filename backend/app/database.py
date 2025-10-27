# app/database.py - VERSÃO MELHORADA

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import StaticPool

# Para desenvolvimento local, carregar .env
if os.environ.get('APP_ENV') == 'development':
    from dotenv import load_dotenv
    load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

# Configurações SSL para Neon.tech
connect_args = {}
if 'neon.tech' in DATABASE_URL:
    connect_args = {
        'sslmode': 'require',
        'sslrootcert': 'system'  # Usa certificados do sistema
    }

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,  # Reconecta a cada 1 hora
    connect_args=connect_args,
    # Para produção, considere usar QueuePool em vez de StaticPool
    poolclass=StaticPool
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()