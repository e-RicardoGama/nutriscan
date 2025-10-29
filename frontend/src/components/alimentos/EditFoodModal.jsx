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
        width: 'calc(100% - 48px)', // Largura do modal - padding
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
    measureInfo: { // Estilo para mostrar a medida caseira
        fontSize: '14px', // Um pouco maior
        color: '#555',
        marginLeft: '8px', // Espaço após o input de unidades
        whiteSpace: 'nowrap', // Evitar quebra de linha
    },
    inputSmall: { // Para o campo unidades
        width: '80px', // Um pouco maior
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    readOnlyInput: { // Estilo para o campo gramas (se quiser desabilitado)
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
        backgroundColor: '#f0f0f0',
        color: '#555',
        cursor: 'not-allowed',
    },
    quantityContainer: { // Para alinhar unidades e medida caseira
        display: 'flex',
        alignItems: 'center', // Alinha verticalmente
        marginBottom: '16px',
    },
    // ... adicione :hover para autocompleteItem e botões
};


// --- Componente do Modal ---
export default function EditFoodModal({ itemParaEditar, foodDatabase, onSave, onClose }) {
    // Estados do formulário
    const [nome, setNome] = useState(itemParaEditar.nome);
    const [gramas, setGramas] = useState(itemParaEditar.peso_g || 100);
    const [unidades, setUnidades] = useState(1); // <-- NOVO ESTADO

    // Estado para o item do DB que foi selecionado (com as colunas novas)
    const [dbItemSelecionado, setDbItemSelecionado] = useState(null);

    // Estados do Autocomplete
    const [sugestoes, setSugestoes] = useState([]);

    // --- Função Helper para calcular gramas ---
    const calcularGramas = (itemDB, numUnidades) => {
        if (itemDB && itemDB.peso_aproximado_g && itemDB.peso_aproximado_g > 0) {
            // Peso por 1 unidade = peso_aproximado_g / unidades_do_db (ou 1 se unidades_do_db for 0 ou nulo)
            const pesoPorUnidadePadrao = itemDB.peso_aproximado_g / (itemDB.unidades || 1);
            return parseFloat((pesoPorUnidadePadrao * numUnidades).toFixed(1));
        }
        return 100; // Retorna um padrão se não for possível calcular
    };

    // --- Efeito para carregar dados iniciais e quando itemParaEditar muda ---
    useEffect(() => {
        setNome(itemParaEditar.nome);
        setSugestoes([]); // Limpa sugestões

        // Tenta encontrar o item correspondente no foodDatabase
        const itemMatch = foodDatabase.find(f => f.alimento.toLowerCase() === itemParaEditar.nome.toLowerCase());

        if (itemMatch) {
            setDbItemSelecionado(itemMatch);
            // Calcula as unidades iniciais com base nas gramas atuais e no peso padrão do item
            const pesoPorUnidadePadrao = itemMatch.peso_aproximado_g / (itemMatch.unidades || 1);
            // Se pesoPorUnidadePadrao for 0, usa as unidades padrão do item (ou 1)
            const unidadesIniciais = pesoPorUnidadePadrao > 0
                ? Math.round((itemParaEditar.peso_g || itemMatch.peso_aproximado_g) / pesoPorUnidadePadrao)
                : (itemMatch.unidades || 1);

            const unidadesValidas = Math.max(1, unidadesIniciais || 1); // Garante pelo menos 1
            setUnidades(unidadesValidas);
            setGramas(calcularGramas(itemMatch, unidadesValidas)); // Define gramas iniciais
        } else {
            // Se não encontrou no DB, reseta para valores padrão
            setDbItemSelecionado(null);
            setUnidades(1);
            setGramas(itemParaEditar.peso_g || 100); // Usa as gramas originais ou 100g
        }
    }, [itemParaEditar, foodDatabase]); // Re-executa se o item a editar ou a base de dados mudarem

    // --- Handlers de Eventos ---

    // Quando o nome do alimento muda (digitação)
    const handleNomeChange = (e) => {
        const valor = e.target.value;
        setNome(valor);
        setDbItemSelecionado(null); // Desvincula do item do DB
        setUnidades(1); // Reseta unidades
        // Poderia resetar gramas aqui também, ou deixar como está
        // setGramas(100);

        // Lógica do autocomplete
        if (valor.length > 2) {
            const matches = foodDatabase.filter(food =>
                food.alimento.toLowerCase().includes(valor.toLowerCase())
            ).slice(0, 5);
            setSugestoes(matches);
        } else {
            setSugestoes([]);
        }
    };

    // Quando clica numa sugestão do autocomplete
    const handleSugestaoClick = (food) => {
        setNome(food.alimento);
        setDbItemSelecionado(food); // Vincula ao item do DB
        const unidadesPadrao = Math.max(1, food.unidades || 1); // Usa unidades do DB (mínimo 1)
        setUnidades(unidadesPadrao);
        setGramas(calcularGramas(food, unidadesPadrao)); // Calcula gramas com base nas unidades padrão
        setSugestoes([]); // Fecha autocomplete
    };

    // Quando o número de unidades é alterado
    const handleUnidadesChange = (e) => {
        const numUnidades = parseInt(e.target.value, 10);
        const unidadesValidas = Math.max(1, numUnidades || 1); // Garante que é número e pelo menos 1
        setUnidades(unidadesValidas);

        // Recalcula gramas APENAS se houver um item do DB selecionado
        if (dbItemSelecionado) {
            setGramas(calcularGramas(dbItemSelecionado, unidadesValidas));
        }
        // Se não houver item selecionado, as gramas NÃO são recalculadas (mantêm o último valor)
    };

    // Quando as gramas são alteradas DIRETAMENTE
    const handleGramasChange = (e) => {
        const gramasDireto = parseFloat(e.target.value) || 0;
        setGramas(gramasDireto);
        // Opcional: Se quiser que a edição direta de gramas desvincule do item do DB:
        // setDbItemSelecionado(null);
        // setUnidades(1); // Poderia resetar unidades também
    };

    // Botão "Usar medida padrão" (agora usa o estado 'unidades')
    // Esta função talvez nem seja mais necessária se o clique na sugestão já define as unidades/gramas padrão
    /*
    const handleUsarMedidaPadrao = () => {
        if (dbItemSelecionado) {
             const unidadesPadrao = Math.max(1, dbItemSelecionado.unidades || 1);
             setUnidades(unidadesPadrao);
             setGramas(calcularGramas(dbItemSelecionado, unidadesPadrao));
        }
    };
    */

    // Quando clica em Salvar
    const handleSalvar = () => {
        // Usa o item selecionado ou tenta encontrar pelo nome final
        const itemFinalDoDB = dbItemSelecionado || foodDatabase.find(f => f.alimento.toLowerCase() === nome.toLowerCase());

        let novosMacros = {};

        // Recalcula macros com base nas GRAMAS finais e nos dados de 100g do item do DB (se encontrado)
        if (itemFinalDoDB) {
            const ratio = gramas / 100.0;
            novosMacros = {
                kcal: (itemFinalDoDB.energia_kcal_100g || 0) * ratio,
                protein: (itemFinalDoDB.proteina_g_100g || 0) * ratio,
                carbs: (itemFinalDoDB.carboidrato_g_100g || 0) * ratio,
                fats: (itemFinalDoDB.lipidios_g_100g || 0) * ratio,
            };
        } else if (nome.toLowerCase() === itemParaEditar.nome.toLowerCase() && itemParaEditar.peso_g > 0) {
            // Nome não mudou E peso original > 0: Recalcula proporcionalmente
             const ratio = gramas / itemParaEditar.peso_g;
             novosMacros = {
                 kcal: (itemParaEditar.kcal || 0) * ratio,
                 protein: (itemParaEditar.protein || 0) * ratio,
                 carbs: (itemParaEditar.carbs || 0) * ratio,
                 fats: (itemParaEditar.fats || 0) * ratio,
             };
        } else {
             // Nome mudou e não achou no DB OU peso original era 0: Zera macros (não sabe calcular)
             novosMacros = { kcal: 0, protein: 0, carbs: 0, fats: 0 };
        }

        // Monta o objeto final atualizado
        const itemAtualizado = {
            ...itemParaEditar,      // Mantém propriedades originais (ID, categoria, etc.)
            ...novosMacros,         // Sobrescreve macros com os recalculados
            nome: nome,             // Nome atualizado
            peso_g: gramas,         // Gramas atualizadas (calculadas ou editadas)
            confianca: 'corrigido', // Marca como corrigido
        };

        onSave(itemAtualizado); // Envia para o componente pai
    };


    // --- JSX / Renderização ---
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
                            {sugestoes.map((food) => ( // Removido index desnecessário
                                <li
                                    // Usar uma chave mais estável se 'food' tiver um ID único
                                    key={food.alimento + food.peso_aproximado_g} 
                                    style={styles.autocompleteItem}
                                    // Usar onMouseDown para executar antes do onBlur do input
                                    onMouseDown={() => handleSugestaoClick(food)}
                                >
                                    {food.alimento}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                 {/* --- Campo Quantidade (Unidades + Medida Caseira) --- */}
                <div style={styles.quantityContainer}> {/* Container para alinhar */}
                    <div style={{ flexShrink: 0 }}> {/* Evita que o label encolha */}
                        <label style={styles.label} htmlFor="food-units">Quantidade</label>
                        <input
                            id="food-units"
                            type="number"
                            min="1" // Input de número aceita min
                            step="0.5" // Permite meia unidade (opcional)
                            value={unidades}
                            onChange={handleUnidadesChange}
                            style={styles.inputSmall} // Input menor
                            // Desabilita se não houver um item do DB selecionado para basear o cálculo
                            disabled={!dbItemSelecionado}
                        />
                    </div>
                    {/* Mostra a medida caseira apenas se houver item selecionado */}
                    {dbItemSelecionado && (
                         <span style={styles.measureInfo}>
                             {dbItemSelecionado.un_medida_caseira || 'unidade(s)'}
                         </span>
                    )}
                </div>

                {/* --- Campo Gramas (Calculado/Editável) --- */}
                <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="food-grams">
                        {/* Muda o label se as gramas forem calculadas */}
                        {dbItemSelecionado ? "Peso Total Estimado (g)" : "Peso Total (g)"}
                    </label>
                    <input
                        id="food-grams"
                        type="number"
                        min="0"
                        step="1" // Ajuste conforme a precisão desejada
                        value={gramas}
                        onChange={handleGramasChange}
                        // Descomente a linha abaixo para tornar apenas leitura quando calculado
                        // readOnly={!!dbItemSelecionado}
                        style={styles.input}
                        // style={dbItemSelecionado ? styles.readOnlyInput : styles.input} // Estilo diferente se for readOnly
                    />
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