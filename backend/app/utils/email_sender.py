import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail,Email

def enviar_email_redefinicao(destinatario: str, link: str):
    """
    Envia email de redefinição de senha usando SendGrid.
    """
    
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    EMAIL_FROM = os.getenv("EMAIL_FROM")

    # Verificações mais robustas
    if not SENDGRID_API_KEY:
        print("❌ [ERRO] SENDGRID_API_KEY não encontrada nas variáveis de ambiente")
        return False

    if not EMAIL_FROM:
        print("❌ [ERRO] EMAIL_FROM não configurado")
        return False

    print(f"📧 Tentando enviar de: {EMAIL_FROM} para: {destinatario}")

    # Template HTML melhorado
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: #2ecc71; 
                      color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }}
            .footer {{ font-size: 12px; color: #777; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <h2>Redefinição de Senha – NutrInfo</h2>
        <p>Olá!</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
        
        <p><a href="{link}" class="button">Redefinir Senha</a></p>
        
        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p><code style="background: #f4f4f4; padding: 8px; border-radius: 4px; word-break: break-all;">{link}</code></p>
        
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
        
        <div class="footer">
            <p>Este link expira em 1 hora.</p>
            <p>Atenciosamente,<br>Equipe NutrInfo</p>
        </div>
    </body>
    </html>
    """

    message = Mail(
        from_email=Email(EMAIL_FROM, "NutrInfo"),
        to_emails=destinatario,
        subject="Redefinição de senha – NutrInfo",
        html_content=html,
    )


    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"✅ Email enviado para {destinatario}, status: {response.status_code}")
        
        # Log adicional para debugging
        if response.status_code >= 400:
            print(f"⚠️  Resposta do SendGrid: {response.body}")
            
        return response.status_code in [200, 202]

    except Exception as e:
        print(f"❌ Erro ao enviar email: {str(e)}")
        
        # Log mais detalhado para debugging
        if hasattr(e, 'body'):
            print(f"📋 Detalhes do erro: {e.body}")
            
        return False