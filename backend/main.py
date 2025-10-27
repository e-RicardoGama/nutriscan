# main.py - VERSÃO MELHORADA
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
import time
import os

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
    version="1.0.0",
    docs_url="/docs" if os.getenv('APP_ENV') == 'development' else None,
    redoc_url="/redoc" if os.getenv('APP_ENV') == 'development' else None
)

# ✅ CONFIGURAÇÃO CORS SEGURA
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
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# ✅ MIDDLEWARE DE HOSTS CONFIÁVEIS (Produção)
if os.getenv('APP_ENV') == 'production':
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["nutri.api.br", "www.nutri.api.br"]
    )

# ✅ INCLUDE ROUTERS COM PREFIXOS
app.include_router(vision_router, prefix="/api/v1", tags=["vision"])
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(usuarios_router, prefix="/api/v1", tags=["usuarios"])
app.include_router(conversoes_router, prefix="/api/v1", tags=["conversoes"])
app.include_router(lgpd_router, prefix="/api/v1", tags=["lgpd"])

# ✅ ROTAS PÚBLICAS
@app.get("/")
def read_root():
    return {"status": "API AppNutri está no ar!", "version": "3.1-SECURE"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "message": "API funcionando normalmente",
        "timestamp": time.time()
    }

@app.get("/api/v1/info")
def api_info():
    return {
        "name": "AppNutri API",
        "version": "1.0.0",
        "environment": os.getenv('APP_ENV', 'development')
    }

# ✅ MIDDLEWARE DE LOG E SEGURANÇA
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    # Headers de segurança
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Log de performance
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    if 'bypass-sw' in request.query_params or 'bypass' in request.query_params:
        print(f"[BACKEND-DEBUG] {request.method} {request.url} - bypass flag detected")
    
    return await call_next(request)