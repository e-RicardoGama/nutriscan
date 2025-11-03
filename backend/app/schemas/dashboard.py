# Certifique-se de que este schema existe em app/schemas/dashboard.py
from typing import Optional, List
from pydantic import BaseModel

class DashboardConsumoDiario(BaseModel):
    total_calorias: float
    total_proteinas_g: float
    total_carboidratos_g: float
    total_gorduras_g: float
    
    class Config:
        from_attributes = True

class MealSummary(BaseModel):
    id: int
    tipo: str
    kcal_estimadas: int
    imagem_url: Optional[str] = None
    
    class Config:
        from_attributes = True