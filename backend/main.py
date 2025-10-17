# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers.vision_alimentos import router as vision_router
from app.routers.auth import router as auth_router
from app.routers.usuarios import router as usuarios_router
from app.routers.conversoes import router as conversoes_router

load_dotenv()

app = FastAPI(
    title="AppNutri API",
    description="API para análise nutricional de alimentos a partir de imagens.",
    version="1.0.0"
)

# ✅ CORRIGIDO: LISTA COMPLETA DE ORIGENS PERMITIDAS
# Adicionamos as URLs do seu site no Firebase.
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://gen-lang-client-0450724380.web.app",
    "https://gen-lang-client-0450724380.firebaseapp.com",
]

# CONFIGURAÇÃO CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(vision_router)
app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(conversoes_router)


@app.get("/")
def read_root():
    return {"status": "API AppNutri está no ar!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API funcionando normalmente"}

