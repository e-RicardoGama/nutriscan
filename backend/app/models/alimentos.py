# app/models/alimentos.py - VERSÃO CORRIGIDA COM RELACIONAMENTO
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship 
from app.database import Base

# app/models/alimentos.py

# ... (imports e outras definições do modelo) ...

class Alimento(Base):
    __tablename__ = "alimentos"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String, index=True)
    alimento_normalizado = Column(String, unique=True, index=True, nullable=False)
    alimentos = Column(String, nullable=False) # Nome original do alimento
    alimento = Column(String, nullable=False) # Nome principal do alimento (pode ser igual a 'alimentos')
    energia_kcal_100g = Column(Float, default=0.0)
    proteina_g_100g = Column(Float, default=0.0)
    carboidrato_g_100g = Column(Float, default=0.0)
    lipidios_g_100g = Column(Float, default=0.0)
    fibra_g_100g = Column(Float, default=0.0)
    ac_graxos_saturados_g = Column(Float, default=0.0)
    ac_graxos_monoinsaturados_g = Column(Float, default=0.0)
    ac_graxos_poliinsaturados_g = Column(Float, default=0.0)
    colesterol_mg_100g = Column(Float, default=0.0)
    sodio_mg_100g = Column(Float, default=0.0)
    potassio_mg_100g = Column(Float, default=0.0)
    calcio_mg_100g = Column(Float, default=0.0)
    ferro_mg_100g = Column(Float, default=0.0)
    magnesio_mg_100g = Column(Float, default=0.0)
    unidades = Column(Float, default=1.0)
    un_medida_caseira = Column(String, nullable=True)
    peso_aproximado_g = Column(Float, default=100.0)

    # Relacionamento com AlimentoSalvo
    alimentos_salvos = relationship("AlimentoSalvo", back_populates="alimento_detalhes")

    def to_dict(self):
        """Converte a instância do modelo Alimento em um dicionário."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def __repr__(self):
        return f"<Alimento(id={self.id}, alimento='{self.alimento}')>"

