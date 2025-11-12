from google.cloud import storage
import os
from dotenv import load_dotenv

# 🚀 Garante que as variáveis do .env são carregadas mesmo em reloads
load_dotenv()

GCS_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
print(GCS_CREDENTIALS_PATH)

if not GCS_CREDENTIALS_PATH:
    raise ValueError(
        "❌ ERRO CRÍTICO: Variável de ambiente GOOGLE_APPLICATION_CREDENTIALS não definida."
    )
if not os.path.exists(GCS_CREDENTIALS_PATH):
    raise FileNotFoundError(
        f"❌ ERRO CRÍTICO: Arquivo de credenciais não encontrado em: {GCS_CREDENTIALS_PATH}"
    )
print(f"✅ GCS Utils inicializado com sucesso!")
print(f"   📁 Credenciais carregadas de: {GCS_CREDENTIALS_PATH}")


def upload_to_gcs(bucket_name: str, file_bytes: bytes,
                  destination_blob_name: str, content_type: str) -> str:
    """Faz upload para o GCS e retorna a URL pública (se o bucket permitir)."""
    print(f"🔍 GCS Upload iniciado:")
    print(f"  - Bucket: {bucket_name}")
    print(f"  - Destino: {destination_blob_name}")
    print(f"  - Tipo: {content_type}")
    print(f"  - Tamanho: {len(file_bytes)} bytes")
    print(f"  - Usando credenciais de: {GCS_CREDENTIALS_PATH}")

    try:
        # ✅ INICIALIZAÇÃO EXPLÍCITA DO CLIENTE COM O ARQUIVO DE CREDENCIAIS
        client = storage.Client.from_service_account_json(GCS_CREDENTIALS_PATH)
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)

        print("📤 Fazendo upload...")
        blob.upload_from_string(file_bytes, content_type=content_type)

        # ⚠️  NÃO CHAME make_public() — UBLA proíbe ACLs individuais
        # blob.make_public()
        # A URL funciona se o bucket tiver policy IAM pública

        url = blob.public_url
        print(f"✅ Upload concluído! URL: {url}")
        return url

    except Exception as e:
        print(f"❌ ERRO no upload GCS: {e}")
        raise
