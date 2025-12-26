# main.py - VERSÃO CORRIGIDA (CORS & DEPLOY)
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import os
import logging

# ✅ IMPORTS DO RATE LIMITING
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Routers
from app.routers.vision_alimentos import router as vision_router
from app.routers.auth import router as auth_router
from app.routers.usuarios import router as usuarios_router
from app.routers.conversoes import router as conversoes_router
from app.routers import alimentos as alimentos_router

# ✅ CONFIGURAR LOGGING
logging.basicConfig(
    level=logging.INFO if os.getenv('APP_ENV') == 'production' else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ✅ CRIAR LIMITER
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"]
)

# ✅ CRIAR APP
app = FastAPI(
    title="AppNutri API",
    description="API para análise nutricional de alimentos a partir de imagens usando IA.",
    version="2.0.0",
    docs_url="/docs" if os.getenv('APP_ENV') != 'production' else None,
    redoc_url="/redoc" if os.getenv('APP_ENV') != 'production' else None,
    openapi_url="/openapi.json" if os.getenv('APP_ENV') != 'production' else None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ✅ CONFIGURAÇÃO CORS CORRIGIDA
def get_cors_origins():
    """Retorna origens permitidas baseado no ambiente"""
    origins = [
        "https://gen-lang-client-0450724380.web.app",
        "https://gen-lang-client-0450724380.firebaseapp.com",
        "https://www.nutri.api.br",
        "https://nutri.api.br",
        "http://localhost:3000",      # Liberado por padrão para facilitar o seu dev
        "http://127.0.0.1:3000",
    ]
    
    # Adiciona origens extras se estiver em desenvolvimento
    if os.getenv('APP_ENV') != 'production':
        origins.extend([
            "http://localhost:5173",
            "http://localhost:8000",
        ])
    
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos para evitar erros de pre-flight
    allow_headers=["*"], # Permite todos os headers
    expose_headers=["*"]
)

# ✅ MIDDLEWARE DE HOSTS CONFIÁVEIS (Apenas Produção)
if os.getenv('APP_ENV') == 'production':
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "nutri.api.br",
            "www.nutri.api.br",
            "nutriscan-backend-925272362555.southamerica-east1.run.app", # Importante incluir o host do Cloud Run
        ]
    )

# ✅ MIDDLEWARE DE SEGURANÇA E LOGGING
@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    try:
        response = await call_next(request)
        
        # Headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    except Exception as e:
        logger.error(f"❌ Erro no middleware: {str(e)}")
        raise

# ✅ TRATAMENTO GLOBAL DE ERROS
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"❌ Erro não tratado: {str(exc)}", exc_info=True)
    message = "Erro interno do servidor" if os.getenv('APP_ENV') == 'production' else str(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": message,
            "status_code": 500,
            "path": request.url.path
        }
    )

# ✅ INCLUDE ROUTERS
app.include_router(auth_router, prefix="/api/v1", tags=["🔐 Autenticação"])
app.include_router(usuarios_router, prefix="/api/v1", tags=["👤 Usuários"])
app.include_router(vision_router, prefix="/api/v1", tags=["📸 Análise de Imagem"])
app.include_router(conversoes_router, prefix="/api/v1", tags=["🔄 Conversões"])
app.include_router(alimentos_router.router, prefix="/api/v1", tags=["🍔 Alimentos"])

@app.get("/", tags=["Status"])
async def read_root(request: Request):
    return {
        "status": "online",
        "environment": os.getenv('APP_ENV', 'development'),
        "version": "2.0.0"
    }

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 AppNutri API iniciando...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 AppNutri API encerrando...")