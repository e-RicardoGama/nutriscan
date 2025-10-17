FROM python:3.10-slim

WORKDIR /app

# Copia os arquivos de requisitos primeiro (cache de dependências)
COPY requirements.txt .

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . .

# ✅ CORREÇÃO: Use Uvicorn diretamente (recomendado para FastAPI)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

# ✅ ALTERNATIVA: Se preferir Gunicorn, use esta configuração:
# CMD ["gunicorn", "main:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]