import React, { useState, useEffect } from 'react';

// --- CSS Básico (Adapte ou use classes Tailwind/CSS) ---
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
     quantityContainer: { // Para alinhar unidades e medida caseira
        display: 'flex',
        alignItems: 'center',
        gap: '12px', // Espaço entre os inputs
        marginBottom: '16px',
    },
    quantityInput: { // Input para Unidades e Gramas
        width: '100px', // Tamanho fixo para os inputs numéricos
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    measureLabel: {
        flex: 1, // Ocupa o espaço restante
        fontSize: '14px',
        color: '#333',
        paddingTop: '24px', // Alinha com os inputs (que têm label)
    },
};


// --- Componente do Modal ---
export default function EditFoodModal({ itemParaEditar, foodDatabase, onSave, onClose }) {
    // Estados do formulário
    const [nome, setNome] = useState(itemParaEditar.nome);
    const [gramas, setGramas] = useState(itemParaEditar.peso_g || 100);
    const [unidades, setUnidades] = useState(1);
    
    // Estados de controlo
    const [medidaCaseira, setMedidaCaseira] = useState('g'); // Ex: "escumadeira cheia" ou "g"
    const [pesoPorUnidade, setPesoPorUnidade] = useState(100); // Peso base para cálculo
    const [sugestoes, setSugestoes] = useState([]);
    
    // --- EFEITO INICIAL: Preenche o modal quando abre ---
    useEffect(() => {
        setNome(itemParaEditar.nome);
        setSugestoes([]);
        
        const gramasIniciais = itemParaEditar.peso_g || 100;
        
        // Tenta encontrar o item na base de dados
        const itemMatch = foodDatabase.find(f => f.alimento.toLowerCase() === itemParaEditar.nome.toLowerCase());
        
        if (itemMatch) {
            // ENCONTROU O ALIMENTO NA BASE DE DADOS
            
            // 1. Calcula o peso de 1 unidade
            // (ex: 100g / 1 unidade = 100)
            const pesoBase = itemMatch.peso_aproximado_g / (itemMatch.unidades || 1);
            setPesoPorUnidade(pesoBase);
            setMedidaCaseira(itemMatch.un_medida_caseira || 'g');

            // 2. Adivinha as unidades com base nas gramas do scan
            // (ex: 200g (do scan) / 100 (pesoBase) = 2 unidades)
            const unidadesIniciais = parseFloat((gramasIniciais / pesoBase).toFixed(1)) || 1;
            setUnidades(unidadesIniciais);
            setGramas(gramasIniciais); // Mantém as gramas do scan

        } else {
            // NÃO ENCONTROU (é um alimento customizado ou com nome diferente)
            // Assume que as gramas do scan são para 1 unidade
            setUnidades(1);
            setGramas(gramasIniciais);
            setPesoPorUnidade(gramasIniciais); // O peso base é o total de gramas
            setMedidaCaseira('g'); // Medida padrão
        }

    }, [itemParaEditar, foodDatabase]); // Depende do item e da base de dados


    // --- Handlers de Eventos ---

    const handleNomeChange = (e) => {
        const valor = e.target.value;
        setNome(valor);
        
        if (valor.length > 2) {
            const matches = foodDatabase.filter(food =>
                food.alimento.toLowerCase().includes(valor.toLowerCase())
            ).slice(0, 5); 
            setSugestoes(matches);
        } else {
            setSugestoes([]);
        }
    };

    // O utilizador CLICOU numa sugestão do autocomplete
    const handleSugestaoClick = (food) => {
        setNome(food.alimento);
        setSugestoes([]);

        // 1. Calcula o peso de 1 unidade
        const pesoBase = food.peso_aproximado_g / (food.unidades || 1);
        setPesoPorUnidade(pesoBase);
        
        // 2. Define os padrões desse alimento
        const unidadesPadrao = food.unidades || 1;
        setUnidades(unidadesPadrao);
        setGramas(food.peso_aproximado_g); // Define as gramas para o peso padrão
        setMedidaCaseira(food.un_medida_caseira || '');
    };

    // O utilizador MUDOU O NÚMERO DE UNIDADES
    const handleUnidadesChange = (e) => {
        const numUnidades = parseFloat(e.target.value) || 0;
        setUnidades(numUnidades);
        
        // Recalcula as gramas (ex: 2 * 100 = 200)
        const gramasCalculadas = parseFloat((pesoPorUnidade * numUnidades).toFixed(1));
        setGramas(gramasCalculadas);
    };
    
    // O utilizador MUDOU AS GRAMAS DIRETAMENTE
    const handleGramasChange = (e) => {
        const numGramas = parseFloat(e.target.value) || 0;
        setGramas(numGramas);
        
        // Recalcula as unidades (ex: 200 / 100 = 2)
        if (pesoPorUnidade > 0) {
            const unidadesCalculadas = parseFloat((numGramas / pesoPorUnidade).toFixed(1));
            setUnidades(unidadesCalculadas);
        }
    };


    // O utilizador SALVOU
    const handleSalvar = () => {
        // Tenta encontrar o item final do DB (para obter macros)
        const itemFinalDoDB = foodDatabase.find(f => f.alimento.toLowerCase() === nome.toLowerCase());

        let novosMacros = {};

        // A lógica de cálculo de macros usa as 'gramas' finais
        if (itemFinalDoDB) {
            const ratio = gramas / 100.0;
            novosMacros = {
                kcal: (itemFinalDoDB.energia_kcal_100g || 0) * ratio,
                protein: (itemFinalDoDB.proteina_g_100g || 0) * ratio,
                carbs: (itemFinalDoDB.carboidrato_g_100g || 0) * ratio,
                fats: (itemFinalDoDB.lipidios_g_100g || 0) * ratio,
            };
        } else if (nome.toLowerCase() === itemParaEditar.nome.toLowerCase()) {
            // Nome não mudou (mas não foi achado no DB): Recalcula proporcionalmente
            const ratio = gramas / (itemParaEditar.peso_g || 100);
            novosMacros = {
                kcal: (itemParaEditar.kcal || 0) * ratio,
                protein: (itemParaEditar.protein || 0) * ratio,
                carbs: (itemParaEditar.carbs || 0) * ratio,
                fats: (itemParaEditar.fats || 0) * ratio,
            };
        } else {
            // Nome mudou e não foi achado no DB: Zera macros
            novosMacros = { kcal: 0, protein: 0, carbs: 0, fats: 0 };
        }

        const itemAtualizado = {
            ...itemParaEditar, 
            ...novosMacros,     
            nome: nome,
            peso_g: gramas, // Usa o estado final de gramas
            confianca: 'corrigido', 
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
                                    key={food.alimento + index}
                                    style={styles.autocompleteItem}
                                    onMouseDown={() => handleSugestaoClick(food)}
                                >
                                    {food.alimento}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* --- Campos Quantidade (Sincronizados) --- */}
                <div style={styles.quantityContainer}> 
                    
                    {/* Input de Unidades */}
                    <div>
                        <label style={styles.label} htmlFor="food-units">Unidades</label>
                        <input
                            id="food-units"
                            type="number"
                            step="0.1" // Permite 0.5, 1.5, etc.
                            value={unidades}
                            onChange={handleUnidadesChange}
                            style={styles.quantityInput}
                        />
                    </div>

                    {/* Mostra a Medida Caseira */}
                    <span style={styles.measureLabel}>
                        {medidaCaseira}
                    </span>

                    {/* Input de Gramas */}
                    <div>
                        <label style={styles.label} htmlFor="food-grams">Gramas</label>
                        <input
                            id="food-grams"
                            type="number"
                            step="10"
                            value={gramas}
                            onChange={handleGramasChange}
                            style={styles.quantityInput}
                        />
                    </div>

                    <span style={styles.measureLabel}>g</span>

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