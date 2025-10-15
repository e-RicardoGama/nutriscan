# Use uma imagem oficial do Python como base.
# Use a versão do Python que seu projeto utiliza. python:3.10-slim é uma boa escolha.
FROM python:3.10-slim

# Define que o output do Python não será armazenado em buffer, o que ajuda a ver os logs em tempo real.
ENV PYTHONUNBUFFERED True

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia o arquivo de dependências primeiro.
# Isso aproveita o cache do Docker e acelera builds futuros se as dependências não mudarem.
COPY requirements.txt ./

# Instala as dependências do seu projeto.
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o resto do código do seu backend para o diretório de trabalho no contêiner.
COPY . .

# Expõe a porta que o Cloud Run usará para enviar tráfego para seu contêiner.
# O Cloud Run define a variável de ambiente $PORT automaticamente.
EXPOSE 8080

# Comando para iniciar sua aplicação.
# Gunicorn é um servidor web de produção recomendado para Python (você precisa adicioná-lo ao seu requirements.txt).
# Este comando diz ao Gunicorn para escutar na porta definida pelo Cloud Run ($PORT).
# "main:app" assume que seu arquivo principal se chama 'main.py' e a instância da sua aplicação é 'app'. Ajuste se for diferente.
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "8", "--timeout", "0", "main:app"]