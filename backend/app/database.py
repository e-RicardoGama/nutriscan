# app/database.py - VERSÃO SIMPLIFICADA

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Para desenvolvimento local, carregar .env
if os.environ.get('APP_ENV') == 'development':
    from dotenv import load_dotenv
    load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

# ✅ SOLUÇÃO SIMPLES: Neon.tech geralmente funciona sem config SSL explícita
engine = create_engine(
    DATABASE_URL,
    pool_size=20,           # Aumente conforme necessidade
    max_overflow=30,        # Conexões extras sob demanda
    pool_pre_ping=True,     # Verifica conexões antes de usar
    pool_recycle=3600,      # Recicla conexões a cada 1h
    echo=False              # DESLIGUE em produção
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
