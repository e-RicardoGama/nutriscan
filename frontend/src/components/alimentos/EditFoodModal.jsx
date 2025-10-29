import React, { useState, useEffect } from 'react';

// --- CSS Básico (Pode ser um arquivo .css separado) ---
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
        position: 'relative', // Para o autocomplete
    },
    inputGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        marginBottom: '4px',
        fontWeight: 600,
        color: '#333',
    },
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
        width: 'calc(100% - 48px)',
        maxHeight: '150px',
        overflowY: 'auto',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        zIndex: 1001,
    },
    autocompleteItem: {
        padding: '8px 12px',
        cursor: 'pointer',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '24px',
    },
    // ... adicione :hover para autocompleteItem e botões
};


// --- Componente do Modal ---
// Removemos ": Props" e todos os outros tipos
export default function EditFoodModal({ itemParaEditar, foodDatabase, onSave, onClose }) {
    // Estados do formulário
    const [nome, setNome] = useState(itemParaEditar.nome);
    const [gramas, setGramas] = useState(itemParaEditar.peso_g || 100);
    
    // Estado para o item do DB que foi selecionado
    const [dbItemSelecionado, setDbItemSelecionado] = useState(null);
    
    // Estados do Autocomplete
    const [sugestoes, setSugestoes] = useState([]);

    // Sincroniza o estado interno se o item para editar mudar
    useEffect(() => {
        setNome(itemParaEditar.nome);
        setGramas(itemParaEditar.peso_g || 100);
        setSugestoes([]);
        
        // Tenta encontrar o item na base de dados
        const itemMatch = foodDatabase.find(f => f.alimento.toLowerCase() === itemParaEditar.nome.toLowerCase());
        setDbItemSelecionado(itemMatch || null);

    }, [itemParaEditar, foodDatabase]);

    // --- Handlers de Eventos ---

    const handleNomeChange = (e) => {
        const valor = e.target.value;
        setNome(valor);
        setDbItemSelecionado(null); // Desseleciona se o usuário voltar a digitar

        if (valor.length > 2) {
            const matches = foodDatabase.filter(food =>
                food.alimento.toLowerCase().includes(valor.toLowerCase())
            ).slice(0, 5); // Limita a 5 sugestões
            setSugestoes(matches);
        } else {
            setSugestoes([]);
        }
    };

    const handleSugestaoClick = (food) => {
        setNome(food.alimento);
        setGramas(food.peso_aproximado_g || 100);
        setDbItemSelecionado(food);
        setSugestoes([]);
    };

    const handleGramasChange = (e) => {
        setGramas(parseFloat(e.target.value) || 0);
    };

    const handleUsarMedidaPadrao = () => {
        if (dbItemSelecionado) {
            setGramas(dbItemSelecionado.peso_aproximado_g || 100);
        }
    };

    const handleSalvar = () => {
        // Tenta encontrar o item final do DB
        const itemFinalDoDB = dbItemSelecionado || foodDatabase.find(f => f.alimento.toLowerCase() === nome.toLowerCase());

        let novosMacros = {};

        if (itemFinalDoDB) {
            // 1. Encontrado no DB: Recalcula macros com base nos dados do DB e novas gramas
            const ratio = gramas / 100.0;
            novosMacros = {
                kcal: (itemFinalDoDB.energia_kcal_100g || 0) * ratio,
                protein: (itemFinalDoDB.proteina_g_100g || 0) * ratio,
                carbs: (itemFinalDoDB.carboidrato_g_100g || 0) * ratio,
                fats: (itemFinalDoDB.lipidios_g_100g || 0) * ratio,
            };
        } else if (nome.toLowerCase() === itemParaEditar.nome.toLowerCase()) {
            // 2. Nome não mudou (mas não foi achado no DB): Recalcula proporcionalmente
            const ratio = gramas / (itemParaEditar.peso_g || 100); // Evita divisão por zero
            novosMacros = {
                kcal: (itemParaEditar.kcal || 0) * ratio,
                protein: (itemParaEditar.protein || 0) * ratio,
                carbs: (itemParaEditar.carbs || 0) * ratio,
                fats: (itemParaEditar.fats || 0) * ratio,
            };
        } else {
            // 3. Nome mudou e não foi achado no DB: Zera macros
            novosMacros = { kcal: 0, protein: 0, carbs: 0, fats: 0 };
        }

        // Monta o objeto final atualizado
        const itemAtualizado = {
            ...itemParaEditar, // Mantém propriedades originais (ID, etc.)
            ...novosMacros,     // Sobrescreve macros
            nome: nome,
            peso_g: gramas,
            confianca: 'corrigido', // Marca como corrigido
        };

        onSave(itemAtualizado);
    };


    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Editar Alimento</h3>

                {/* --- Campo Nome (com Autocomplete) --- */}
                <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="food-name">Alimento</label>
                    <input
                        id="food-name"
                        type="text"
                        value={nome}
                        onChange={handleNomeChange}
                        style={styles.input}
                        autoComplete="off"
                    />
                    {sugestoes.length > 0 && (
                        <ul style={styles.autocompleteList}>
                            {sugestoes.map((food, index) => (
                                <li
                                    key={index} // Idealmente, 'food' teria um 'id' único
                                    style={styles.autocompleteItem}
                                    onMouseDown={() => handleSugestaoClick(food)} // onMouseDown executa antes do onBlur do input
                                >
                                    {food.alimento}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* --- Campo Gramas e Medida Caseira --- */}
                <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="food-grams">Quantidade (em gramas)</label>
                    <input
                        id="food-grams"
                        type="number"
                        value={gramas}
                        onChange={handleGramasChange}
                        style={styles.input}
                    />
                    {/* Botão helper para Medida Caseira */}
                    {dbItemSelecionado && dbItemSelecionado.peso_aproximado_g > 0 && (
                         <button 
                            type="button" 
                            onClick={handleUsarMedidaPadrao}
                            style={{marginTop: '8px', fontSize: '12px'}}
                         >
                            Usar medida padrão: {dbItemSelecionado.un_medida_caseira} ({dbItemSelecionado.peso_aproximado_g}g)
                         </button>
                    )}
                </div>

                {/* --- Botões de Ação --- */}
                <div style={styles.buttonContainer}>
                    <button type="button" onClick={onClose} style={{background: '#eee'}}>
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSalvar} style={{background: '#007bff', color: 'white'}}>
                        Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
}