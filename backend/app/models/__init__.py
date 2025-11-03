# Importa os modelos de cada arquivo para 
# que fiquem acessíveis como "models.NomeDoModelo"

# Assumindo que você tem um app/models/refeicoes.py
from .refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus

# Assumindo que você tem um app/models/usuario.py
from .usuario import Usuario

# Assumindo que você tem um app/models/alimentos.py
from .alimentos import Alimento

# Adicione aqui outros modelos que você tenha