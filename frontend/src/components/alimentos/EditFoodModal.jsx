import React, { useState, useEffect } from 'react';

// --- CSS Básico ---
const styles = {
  modalBackdrop: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    position: 'relative',
  },
  inputGroup: { marginBottom: '16px', position: 'relative' },
  label: { display: 'block', marginBottom: '4px', fontWeight: 600, color: '#333' },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  autocompleteList: {
    position: 'absolute',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '100%',
    maxHeight: '150px',
    overflowY: 'auto',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    zIndex: 1001,
  },
  autocompleteItem: { padding: '8px 12px', cursor: 'pointer' },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '24px',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  quantityInput: {
    width: '100px',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  measureLabel: {
    fontSize: '0.85rem',
    color: '#555',
    fontStyle: 'italic',
  },
};

function EditFoodModal({ itemParaEditar, foodDatabase, onSave, onClose }) {
  // --------------------------
  // 1. Estados locais
  // --------------------------
  const [nome, setNome] = useState(itemParaEditar?.nome || '');
  const [calorias, setCalorias] = useState(
    // tenta usar a prop que existe, com fallback para 0
    itemParaEditar?.calorias_estimadas ??
    itemParaEditar?.calorias_estimadas_kcal ??
    0
  );
  const [gramas, setGramas] = useState(
    itemParaEditar?.quantidade_estimada_g ??
    itemParaEditar?.quantidade_g ??
    100
  );

  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [medidaCaseira, setMedidaCaseira] = useState('');
  const [gramasPorUnidade, setGramasPorUnidade] = useState(0);

  // --------------------------
  // 2. Efeito: quando abrir modal, inicializa campos de medida caseira
  // --------------------------
  useEffect(() => {
    if (!foodDatabase || !Array.isArray(foodDatabase)) return;

    const match = foodDatabase.find((item) => {
      // tenta comparar por nome; se backend usar outro campo, pode ajustar aqui
      return item.nome === itemParaEditar?.nome;
    });

    if (match) {
      setMedidaCaseira(
        match.medida_caseira_unidade ||
        match.medida_caseira ||
        ''
      );
      setGramasPorUnidade(
        match.medida_caseira_gramas_por_unidade ||
        match.gramas_por_unidade ||
        0      );
    }
  }, [foodDatabase, itemParaEditar]);

  // --------------------------
  // 3. Auto-complete de alimento
  // --------------------------
  useEffect(() => {
    if (!foodDatabase || !Array.isArray(foodDatabase)) return;

    if (!termoBusca || termoBusca.length < 2) {
      setResultadosBusca([]);
      setMostrarSugestoes(false);
      return;
    }

    const termoLower = termoBusca.toLowerCase();
    const filtrados = foodDatabase.filter((item) => {
      const nomeItem = (item.nome || '').toLowerCase();
      const categoriaItem = (item.categoria || '').toLowerCase();
      return (
        nomeItem.includes(termoLower) ||
        categoriaItem.includes(termoLower)
      );
    });

    setResultadosBusca(filtrados);
    setMostrarSugestoes(true);
  }, [termoBusca, foodDatabase]);

  const handleSelecionarSugestao = (itemBanco) => {
    setNome(itemBanco.nome || '');
    // se existir essa estrutura no banco, usa:
    if (itemBanco.calorias_por_100g) {
      // converte para a quantidade atual em gramas
      const kcal = (itemBanco.calorias_por_100g * gramas) / 100;
      setCalorias(Math.round(kcal));
    }
    setMedidaCaseira(
      itemBanco.medida_caseira_unidade ||
      itemBanco.medida_caseira ||
      ''
    );
    setGramasPorUnidade(
      itemBanco.medida_caseira_gramas_por_unidade ||
      itemBanco.gramas_por_unidade ||
      0
    );
    setMostrarSugestoes(false);
  };

  // --------------------------
  // 4. Quantidade em gramas
  // --------------------------
  const handleGramasChange = (e) => {
    const valor = Number(e.target.value) || 0;
    setGramas(valor);

    // se houver informação de cal / 100g no item original ou no DB, recalcula
    const baseCalorias =
      itemParaEditar?.calorias_por_100g ??
      (itemParaEditar?.calorias_estimadas && itemParaEditar.quantidade_estimada_g
        ? (itemParaEditar.calorias_estimadas * 100) / itemParaEditar.quantidade_estimada_g
        : null);

    if (baseCalorias) {
      const kcal = (baseCalorias * valor) / 100;
      setCalorias(Math.round(kcal));
    }
  };

  // --------------------------
  // 5. Salvar alterações
  // --------------------------
  const handleSalvar = () => {
    const itemAtualizado = {
      ...itemParaEditar,
      nome,
      quantidade_estimada_g: gramas,
      calorias_estimadas: calorias,
    };
    onSave(itemAtualizado);
    onClose();
  };

  // --------------------------
  // 6. Render
  // --------------------------
  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Editar Alimento
        </h2>

        {/* Nome / busca */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Alimento</label>
          <input
            type="text"
            style={styles.input}
            value={termoBusca || nome}
            onChange={(e) => {
              setTermoBusca(e.target.value);
              setNome(e.target.value);
            }}
            onFocus={() => {
              if (resultadosBusca.length > 0) setMostrarSugestoes(true);
            }}
          />
          {mostrarSugestoes && resultadosBusca.length > 0 && (
            <ul style={styles.autocompleteList}>
              {resultadosBusca.map((item, idx) => (
                <li
                  key={idx}
                  style={styles.autocompleteItem}
                  onClick={() => handleSelecionarSugestao(item)}
                >
                  <strong>{item.nome}</strong>
                  {item.categoria && (
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: 4 }}>
                      ({item.categoria})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Calorias */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Calorias estimadas (kcal)</label>
          <input
            type="number"
            style={styles.input}
            value={calorias}
            onChange={(e) => setCalorias(Number(e.target.value) || 0)}
          />
        </div>

        {/* Quantidade e medida caseira */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Quantidade</label>
          <div style={styles.quantityContainer}>
            <div>
              <label style={styles.label}>Em gramas</label>
              <input
                type="number"
                step="10"
                value={gramas}
                onChange={handleGramasChange}
                style={styles.quantityInput}
              />
            </div>
            {medidaCaseira && gramasPorUnidade > 0 && (
              <div>
                <label style={styles.label}>Equivalência</label>
                <div style={styles.measureLabel}>
                  {`${(gramas / gramasPorUnidade).toFixed(1)} ${medidaCaseira}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="bg-green-600 text-white font-bold px-4 py-2 rounded"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditFoodModal;
