// src/utils/nutrition.ts

// Cole a função aqui e adicione 'export' na frente
export function splitVitsAndMins(lista?: string[]) {
  if (!lista || lista.length === 0) return { vitaminas: [] as string[], minerais: [] as string[] };

  const mineraisConhecidos = [
    'cálcio','calcio','ferro','magnésio','magnesio','fósforo','fosforo','potássio','potassio',
    'sódio','sodio','selênio','selenio','zinco','cobre','manganês','manganes','iodo','iodeto'
  ].map(s => s.toLowerCase());

  const vitaminas: string[] = [];
  const minerais: string[] = [];

  lista.forEach(item => {
    const texto = (item || '').toLowerCase();

    // heurística direta para vitaminas
    if (texto.includes('vitamina') || /^vit[^\s]*/i.test(item) || texto.startsWith('b') && texto.length <= 3) {
      vitaminas.push(item);
      return;
    }

    // se bater com mineral conhecido => mineral
    const isMineral = mineraisConhecidos.some(m => texto.includes(m));
    if (isMineral) {
      minerais.push(item);
      return;
    }

    // fallback por comprimento/estrutura
    if (texto.length <= 12 && !texto.includes(' ')) {
      minerais.push(item);
      return;
    }

    // caso indeciso, joga em vitaminas
    vitaminas.push(item);
  });

  return { vitaminas, minerais };
}