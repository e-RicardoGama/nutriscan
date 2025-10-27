# main.py - CONFIGURAÇÃO CORS CORRIGIDA + LGPDConsent
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Routers existentes
from app.routers.vision_alimentos import router as vision_router
from app.routers.auth import router as auth_router
from app.routers.usuarios import router as usuarios_router
from app.routers.conversoes import router as conversoes_router

# Novo router LGPDConsent
from app.routers.lgpd_consent import router as lgpd_router

load_dotenv()

app = FastAPI(
    title="AppNutri API",
    description="API para análise nutricional de alimentos a partir de imagens.",
    version="1.0.0"
)

# ✅ CONFIGURAÇÃO CORS
origins = [
    "https://gen-lang-client-0450724380.web.app",
    "https://www.nutri.api.br",
    "https://nutri.api.br",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUDE ROUTERS
app.include_router(vision_router)
app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(conversoes_router)
app.include_router(lgpd_router)  # Novo endpoint LGPDConsent

# ✅ ROTAS PÚBLICAS
@app.get("/")
def read_root():
    return {"status": "API AppNutri está no ar!", "version": "3.0-CORS-FIXED"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API funcionando normalmente"}

# ✅ MIDDLEWARE DE DEBUG
@app.middleware("http")
async def log_bypass_sw(request: Request, call_next):
    if 'bypass-sw' in request.query_params or 'bypass' in request.query_params:
        print("[BACKEND-DEBUG] bypass flag in request:", request.url)
    return await call_next(request)
