from google.cloud import storage
import os
from dotenv import load_dotenv

# 🚀 Carrega variáveis do .env apenas se estiver rodando localmente
load_dotenv()

def detect_environment() -> str:
    """Detecta se o código está rodando localmente ou em produção (Cloud Run)."""
    if os.getenv("K_SERVICE"):  # Variável sempre presente no Cloud Run
        return "cloud_run"
    return "local"

ENVIRONMENT = detect_environment()

print("✅ Inicializando GCS Utils...")
print(f"   🌐 Ambiente detectado: {ENVIRONMENT}")

# 🔐 Em produção, o Cloud Run usa credenciais automáticas da service account.
# Localmente, usamos a variável GOOGLE_APPLICATION_CREDENTIALS se existir.
GCS_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

def get_storage_client():
    """Retorna o cliente GCS apropriado para o ambiente."""
    if ENVIRONMENT == "local" and GCS_CREDENTIALS_PATH:
        if not os.path.exists(GCS_CREDENTIALS_PATH):
            raise FileNotFoundError(
                f"❌ Arquivo de credenciais não encontrado em: {GCS_CREDENTIALS_PATH}"
            )
        print(f"🔑 Usando credenciais locais: {GCS_CREDENTIALS_PATH}")
        return storage.Client.from_service_account_json(GCS_CREDENTIALS_PATH)
    else:
        print("🔐 Usando autenticação automática (Cloud Run / ADC).")
        return storage.Client()

def upload_to_gcs(bucket_name: str, file_bytes: bytes,
                  destination_blob_name: str, content_type: str) -> str:
    """Faz upload para o GCS e retorna a URL pública (se o bucket permitir)."""
    print(f"🔍 Iniciando upload GCS:")
    print(f"  - Bucket: {bucket_name}")
    print(f"  - Destino: {destination_blob_name}")
    print(f"  - Tipo: {content_type}")
    print(f"  - Tamanho: {len(file_bytes)} bytes")

    try:
        client = get_storage_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)

        print("📤 Fazendo upload para o bucket...")
        blob.upload_from_string(file_bytes, content_type=content_type)

        # ⚠️ Não use make_public() — UBLA proíbe ACLs individuais
        url = blob.public_url
        print(f"✅ Upload concluído! URL: {url}")
        return url

    except Exception as e:
        print(f"❌ ERRO no upload GCS: {e}")
        raise
