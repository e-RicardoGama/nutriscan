# 🐍 Imagem base leve e segura
FROM python:3.10-slim

# 📁 Define diretório de trabalho
WORKDIR /app

# 🕒 Define timezone e evita prompts interativos
ENV TZ=America/Sao_Paulo
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ⚙️ Instala dependências do sistema necessárias (psycopg2, imagem, etc)
# tzdata -> timezone
# libpq-dev + gcc -> compilação do psycopg2
# curl -> utilitário útil para debug e healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    tzdata \
    curl \
  && rm -rf /var/lib/apt/lists/*

# 🧩 Copia apenas o requirements.txt primeiro (melhora cache)
COPY requirements.txt .

# 🔽 Instala dependências Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 🧱 Copia o restante da aplicação
COPY . .

# 🔒 Ajusta permissões para rodar com usuário não-root
RUN useradd -m appuser
USER appuser

# 🚪 Expõe a porta (opcional — Cloud Run usa 8080 automaticamente)
EXPOSE 8080

# 🚀 Comando de inicialização (FastAPI via Uvicorn)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
