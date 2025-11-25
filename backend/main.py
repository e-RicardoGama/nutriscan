# main.py - VERSÃO OTIMIZADA E SEGURA
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
#from dotenv import load_dotenv
import time
import os
import logging
from starlette.middleware.cors import CORSMiddleware

# ✅ IMPORTS DO RATE LIMITING (ANTES DA CRIAÇÃO DO APP)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Routers existentes
from app.routers.vision_alimentos import router as vision_router
from app.routers.auth import router as auth_router
from app.routers.usuarios import router as usuarios_router
from app.routers.conversoes import router as conversoes_router
from app.routers import alimentos as alimentos_router

# ✅ CARREGAR VARIÁVEIS DE AMBIENTE
#load_dotenv()

# ✅ CONFIGURAR LOGGING
logging.basicConfig(
    level=logging.INFO if os.getenv('APP_ENV') == 'production' else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ✅ CRIAR LIMITER ANTES DO APP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"]  # Limite global padrão
)

# ✅ CRIAR APP COM CONFIGURAÇÕES CONDICIONAIS
app = FastAPI(
    title="AppNutri API",
    description="API para análise nutricional de alimentos a partir de imagens usando IA.",
    version="2.0.0",
    docs_url="/docs" if os.getenv('APP_ENV') != 'production' else None,
    redoc_url="/redoc" if os.getenv('APP_ENV') != 'production' else None,
    openapi_url="/openapi.json" if os.getenv('APP_ENV') != 'production' else None
)

# ✅ CONFIGURAR LIMITER NO APP
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ✅ CONFIGURAÇÃO CORS SEGURA E DINÂMICA
def get_cors_origins():
    """Retorna origens permitidas baseado no ambiente"""
    base_origins = [
        "https://gen-lang-client-0450724380.web.app",
        "https://www.nutri.api.br",
        "https://nutri.api.br",
    ]
    
    # Adicionar origens de desenvolvimento apenas em dev
    if os.getenv('APP_ENV') != 'production':
        base_origins.extend([
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "http://0.0.0.0:3000",
            "http://localhost:5173",
        ])
    
    return base_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=[
        "Content-Type",
        "X-Total-Count",
        "X-Page-Number",
        "X-Page-Size",
    ]  # ✅ Específico em vez de "*"
)

# ✅ MIDDLEWARE DE HOSTS CONFIÁVEIS (Apenas Produção)
if os.getenv('APP_ENV') == 'production':
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "nutri.api.br",
            "www.nutri.api.br",
            "api.nutri.com.br",  # Adicione outros domínios se necessário
        ]
    )

# ✅ MIDDLEWARE DE SEGURANÇA E LOGGING (CONDICIONAL)
@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    """
    Middleware para logging e headers de segurança.
    Comportamento diferente em dev vs produção.
    """
    start_time = time.time()
    
    # ✅ LOGGING CONDICIONAL
    if os.getenv('APP_ENV') != 'production':
        # Modo desenvolvimento: logs detalhados
        origin = request.headers.get("origin", "N/A")
        logger.debug(f"📥 {request.method} {request.url.path} from {origin}")
    else:
        # Modo produção: logs mínimos
        logger.info(f"{request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        
        # ✅ ADICIONAR HEADERS DE SEGURANÇA
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # ✅ LOGGING DE PERFORMANCE
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        if os.getenv('APP_ENV') != 'production':
            logger.debug(f"📤 Response: {response.status_code} ({process_time:.3f}s)")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Erro no middleware: {str(e)}")
        raise

# ✅ TRATAMENTO GLOBAL DE ERROS
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler customizado para HTTPException"""
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
    """Handler para exceções não tratadas"""
    logger.error(f"❌ Erro não tratado: {str(exc)}", exc_info=True)
    
    # Em produção, não expor detalhes do erro
    if os.getenv('APP_ENV') == 'production':
        message = "Erro interno do servidor"
    else:
        message = str(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": message,
            "status_code": 500,
            "path": request.url.path
        }
    )

# ✅ INCLUDE ROUTERS COM PREFIXOS
app.include_router(auth_router, prefix="/api/v1", tags=["🔐 Autenticação"])
app.include_router(usuarios_router, prefix="/api/v1", tags=["👤 Usuários"])
app.include_router(vision_router, prefix="/api/v1", tags=["📸 Análise de Imagem"])
app.include_router(conversoes_router, prefix="/api/v1", tags=["🔄 Conversões"])
app.include_router(alimentos_router.router, prefix="/api/v1", tags=["🍔 Alimentos"])

# ✅ ROTAS PÚBLICAS COM RATE LIMITING
@app.get("/", tags=["Status"])
@limiter.limit("10/minute")  # ✅ Rate limit na rota raiz
async def read_root(request: Request):
    """Rota raiz da API"""
    return {
        "status": "online",
        "message": "API AppNutri está no ar! 🚀",
        "version": "2.0.0",
        "environment": os.getenv('APP_ENV', 'development'),
        "docs": "/docs" if os.getenv('APP_ENV') != 'production' else "disabled"
    }

@app.get("/health", tags=["Status"])
@limiter.limit("30/minute")
async def health_check(request: Request):
    """Health check para monitoramento"""
    return {
        "status": "healthy",
        "message": "API funcionando normalmente",
        "timestamp": time.time(),
        "environment": os.getenv('APP_ENV', 'development')
    }

@app.get("/api/v1/info", tags=["Status"])
@limiter.limit("20/minute")
async def api_info(request: Request):
    """Informações sobre a API"""
    return {
        "name": "AppNutri API",
        "description": "API para análise nutricional de alimentos usando IA",
        "version": "2.0.0",
        "environment": os.getenv('APP_ENV', 'development'),
        "features": [
            "Análise de imagem com Google Vision AI",
            "Recomendações nutricionais personalizadas",
            "Autenticação JWT",
            "Conformidade LGPD"
        ],
        "endpoints": {
            "auth": "/api/v1/auth",
            "usuarios": "/api/v1/usuarios",
            "vision": "/api/v1/vision",
            "conversoes": "/api/v1/conversoes",
            "lgpd": "/api/v1/lgpd"
        }
    }

# ✅ ROTA DE TESTE (APENAS DESENVOLVIMENTO)
if os.getenv('APP_ENV') != 'production':
    @app.get("/debug/headers", tags=["Debug"])
    async def debug_headers(request: Request):
        """Rota de debug para ver headers da requisição"""
        return {
            "headers": dict(request.headers),
            "client": request.client.host if request.client else "unknown",
            "method": request.method,
            "url": str(request.url)
        }

# ✅ EVENTO DE STARTUP
@app.on_event("startup")
async def startup_event():
    """Executado quando a aplicação inicia"""
    logger.info("🚀 AppNutri API iniciando...")
    logger.info(f"📍 Ambiente: {os.getenv('APP_ENV', 'development')}")
    logger.info(f"🔒 CORS Origins: {len(get_cors_origins())} configuradas")
    logger.info("✅ API pronta para receber requisições!")

# ✅ EVENTO DE SHUTDOWN
@app.on_event("shutdown")
async def shutdown_event():
    """Executado quando a aplicação é encerrada"""
    logger.info("👋 AppNutri API encerrando...")
    logger.info("✅ Shutdown concluído com sucesso!")
