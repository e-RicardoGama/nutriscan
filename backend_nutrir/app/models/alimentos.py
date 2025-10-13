# app/models.py - VERSÃO CORRIGIDA

from sqlalchemy import Column, Integer, String, Float

# Importa a Base do seu arquivo database.py
from app.database import Base

class Alimento(Base):
    """
    Modelo SQLAlchemy representando um alimento e seus nutrientes na tabela 'alimentos'.
    """
    __tablename__ = "alimentos"

    id = Column(Integer, primary_key=True, index=True)
    
    # --- Identificação do Alimento ---
    categoria = Column(String(255), index=True)
    alimento_normalizado = Column(String(255), unique=True, index=True)
    alimentos = Column(String(255))
    alimento = Column(String(255))
    
    # --- Macronutrientes (por 100g) ---
    energia_kcal_100g = Column(Float)
    proteina_g_100g = Column(Float)
    carboidrato_g_100g = Column(Float)
    lipidios_g_100g = Column(Float)
    fibra_g_100g = Column(Float)
    
    # --- Detalhes de Gorduras e Colesterol (por 100g) ---
    ac_graxos_saturados_g = Column(Float)
    ac_graxos_monoinsaturados_g = Column(Float)
    ac_graxos_poliinsaturados_g = Column(Float)
    colesterol_mg_100g = Column(Float, nullable=True)
    
    # --- Micronutrientes (por 100g) ---
    sodio_mg_100g = Column(Float)
    potassio_mg_100g = Column(Float)
    calcio_mg_100g = Column(Float)
    ferro_mg_100g = Column(Float)
    magnesio_mg_100g = Column(Float)

    # --- Medidas Caseiras (referência) ---
    unidades = Column(Float)
    un_medida_caseira = Column(String(255))
    peso_aproximado_g = Column(Float)

    # --- Refeições ---
    dieta = Column(String(255))
    refeicao = Column(String(255))
    status = Column(String(255))
