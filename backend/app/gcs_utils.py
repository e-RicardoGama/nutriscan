from google.cloud import storage

def upload_to_gcs(bucket_name: str, file_bytes: bytes,
                  destination_blob_name: str, content_type: str) -> str:
    """Faz upload para o GCS e retorna a URL pública (se o bucket permitir)."""
    print(f"🔍 GCS Upload iniciado:")
    print(f"  - Bucket: {bucket_name}")
    print(f"  - Destino: {destination_blob_name}")
    print(f"  - Tipo: {content_type}")
    print(f"  - Tamanho: {len(file_bytes)} bytes")

    try:
        client = storage.Client()
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
