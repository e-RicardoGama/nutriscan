import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def enviar_email_redefinicao(destinatario: str, link: str):
    """
    Envia email de redefinição de senha usando SendGrid.
    """

    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

    print("KEY:", os.getenv("SENDGRID_API_KEY"))

    EMAIL_FROM = os.getenv("EMAIL_FROM", "no-reply@nutriscan.com")
    print("e-mail:", os.getenv("EMAIL_FROM"))

    if not SENDGRID_API_KEY:
        print("❌ [ERRO] SENDGRID_API_KEY não encontrado no .env")
        return False

    # Template HTML
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Redefinição de Senha – NutriScan</h2>
        <p>Olá!</p>
        <p>Clique no botão abaixo para redefinir sua senha:</p>

        <a href="{link}"
           style="padding: 10px 18px; background-color: #2ecc71; color: white;
                  text-decoration: none; border-radius: 6px;">
           Redefinir Senha
        </a>

        <p>Se você não solicitou isso, basta ignorar.</p>
        <p style="font-size: 12px; color: gray;">Este link expira em 1 hora.</p>
      </body>
    </html>
    """

    message = Mail(
        from_email=EMAIL_FROM,
        to_emails=destinatario,
        subject="Redefinição de senha – NutriScan",
        html_content=html,
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Email enviado para {destinatario}, status: {response.status_code}")
        return True

    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")
        return False
