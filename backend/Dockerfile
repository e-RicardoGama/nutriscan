FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema (para psycopg2 e tzdata/pytz)
# gcc é necessário para compilar psycopg2-binary
# libpq-dev fornece os headers para psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Expor porta (boa prática, mas o Cloud Run já sabe que é 8080)
EXPOSE 8080

# Comando de execução
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
