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
    inputGroup: { marginBottom: '16px' },
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
        width: 'calc(100% - 48px)',
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
        marginBottom: '16px',
    },
    quantityInput: {
        width: '100px',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    measureLabel: {
        flex: 1,
        fontSize: '14px',
        color: '#333',
        paddingTop: '24px',
    },
};

// ---------------------------------------------------------------------------
//  Modal Aceitando foodDatabase CORRETAMENTE
// ---------------------------------------------------------------------------

export default function EditFoodModal({
    itemParaEditar,
    foodDatabase = [],   // ← Fallback importante
    onSave,
    onClose
}) {

    // ---------------------- ESTADOS ----------------------
    const [nome, setNome] = useState(itemParaEditar?.nome || "");
    const [gramas, setGramas] = useState(itemParaEditar?.peso_g || 100);
    const [unidades, setUnidades] = useState(1);

    const [medidaCaseira, setMedidaCaseira] = useState("g");
    const [pesoPorUnidade, setPesoPorUnidade] = useState(100);
    const [sugestoes, setSugestoes] = useState([]);

    // ---------------------- EFEITO INICIAL ----------------------
    useEffect(() => {
        if (!itemParaEditar) return;

        setNome(itemParaEditar.nome || "");
        setSugestoes([]);

        const gramasIniciais = itemParaEditar.peso_g || 100;

        const itemMatch = foodDatabase.find(
            f => f.alimento?.toLowerCase() === itemParaEditar.nome?.toLowerCase()
        );

        if (itemMatch) {
            const pesoBase = (itemMatch.peso_aproximado_g || 100) / (itemMatch.unidades || 1);

            setPesoPorUnidade(pesoBase);
            setMedidaCaseira(itemMatch.un_medida_caseira || "g");

            const unidadesCalc = parseFloat((gramasIniciais / pesoBase).toFixed(1)) || 1;
            setUnidades(unidadesCalc);
            setGramas(gramasIniciais);

        } else {
            setUnidades(1);
            setGramas(gramasIniciais);
            setPesoPorUnidade(gramasIniciais);
            setMedidaCaseira("g");
        }

    }, [itemParaEditar, foodDatabase]);

    // ---------------------- Handlers ----------------------

    const handleNomeChange = (e) => {
        const valor = e.target.value;
        setNome(valor);

        if (valor.length > 2) {
            const matches = foodDatabase
                .filter(f => f.alimento?.toLowerCase().includes(valor.toLowerCase()))
                .slice(0, 5);

            setSugestoes(matches);
        } else {
            setSugestoes([]);
        }
    };

    const handleSugestaoClick = (food) => {
        setNome(food.alimento);
        setSugestoes([]);

        const pesoBase = (food.peso_aproximado_g || 100) / (food.unidades || 1);
        setPesoPorUnidade(pesoBase);

        setUnidades(food.unidades || 1);
        setGramas(food.peso_aproximado_g || 100);
        setMedidaCaseira(food.un_medida_caseira || "g");
    };

    const handleUnidadesChange = (e) => {
        const num = parseFloat(e.target.value) || 0;
        setUnidades(num);

        setGramas(parseFloat((pesoPorUnidade * num).toFixed(1)));
    };

    const handleGramasChange = (e) => {
        const num = parseFloat(e.target.value) || 0;
        setGramas(num);

        if (pesoPorUnidade > 0) {
            setUnidades(parseFloat((num / pesoPorUnidade).toFixed(1)));
        }
    };

    // ---------------------- SALVAR ----------------------

    const handleSalvar = () => {
        const itemDB = foodDatabase.find(
            f => f.alimento?.toLowerCase() === nome.toLowerCase()
        );

        let novosMacros = {};

        if (itemDB) {
            const ratio = gramas / 100;

            novosMacros = {
                kcal: (itemDB.energia_kcal_100g || 0) * ratio,
                protein: (itemDB.proteina_g_100g || 0) * ratio,
                carbs: (itemDB.carboidrato_g_100g || 0) * ratio,
                fats: (itemDB.lipidios_g_100g || 0) * ratio,
            };

        } else if (nome.toLowerCase() === itemParaEditar.nome.toLowerCase()) {
            const ratio = gramas / (itemParaEditar.peso_g || 100);

            novosMacros = {
                kcal: (itemParaEditar.kcal || 0) * ratio,
                protein: (itemParaEditar.protein || 0) * ratio,
                carbs: (itemParaEditar.carbs || 0) * ratio,
                fats: (itemParaEditar.fats || 0) * ratio,
            };

        } else {
            novosMacros = { kcal: 0, protein: 0, carbs: 0, fats: 0 };
        }

        const itemAtualizado = {
            ...itemParaEditar,
            ...novosMacros,
            nome,
            peso_g: gramas,
            confianca: "corrigido",
        };

        onSave(itemAtualizado);
    };

    // ---------------------- RENDER ----------------------

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginTop: 0, marginBottom: "24px" }}>Editar Alimento</h3>

                {/* Nome com autocomplete */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Alimento</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={handleNomeChange}
                        style={styles.input}
                        autoComplete="off"
                    />

                    {sugestoes.length > 0 && (
                        <ul style={styles.autocompleteList}>
                            {sugestoes.map((food, idx) => (
                                <li
                                    key={idx}
                                    style={styles.autocompleteItem}
                                    onMouseDown={() => handleSugestaoClick(food)}
                                >
                                    {food.alimento}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Quantidades */}
                <div style={styles.quantityContainer}>
                    <div>
                        <label style={styles.label}>Unidades</label>
                        <input
                            type="number"
                            step="0.1"
                            value={unidades}
                            onChange={handleUnidadesChange}
                            style={styles.quantityInput}
                        />
                    </div>

                    <span style={styles.measureLabel}>{medidaCaseira}</span>

                    <div>
                        <label style={styles.label}>Gramas</label>
                        <input
                            type="number"
                            step="10"
                            value={gramas}
                            onChange={handleGramasChange}
                            style={styles.quantityInput}
                        />
                    </div>
                </div>

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
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
}
