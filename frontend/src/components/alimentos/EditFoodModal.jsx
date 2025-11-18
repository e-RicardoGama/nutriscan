// frontend_nutri/src/components/alimentos/EditFoodModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react'; // Importe o ícone de busca se for usar
import { debounce } from 'lodash';

// Adicione 'onSearchFood' na desestruturação das props
function EditFoodModal({
  itemParaEditar,
  foodDatabase,
  onSearchFood,
  onSave,
  onClose 
}) {
  const [nome, setNome] = useState(itemParaEditar.nome);
  const [quantidade, setQuantidade] = useState(itemParaEditar.peso_g);
  const [categoria, setCategoria] = useState(itemParaEditar.categoria);
  const [kcal, setKcal] = useState(itemParaEditar.kcal);
  const [protein, setProtein] = useState(itemParaEditar.protein);
  const [carbs, setCarbs] = useState(itemParaEditar.carbs);
  const [fats, setFats] = useState(itemParaEditar.fats);

  // Estado para o termo de busca do autocomplete
  const [searchTerm, setSearchTerm] = useState(itemParaEditar.nome);
  // Estado para os resultados da busca (do foodDatabase local ou da API)
  const [suggestions, setSuggestions] = useState([]);
  // Estado para controlar se as sugestões estão visíveis
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const performSearch = async (term) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      // Primeiro, busca no foodDatabase local (rápido)
      const localSuggestions = foodDatabase.filter(item =>
        item.alimento.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5); // Limita as sugestões locais

      let apiSuggestions = [];
      if (onSearchFood) { // Se a prop onSearchFood foi fornecida
        apiSuggestions = await onSearchFood(term);
      }

      // Combina e remove duplicatas (baseado no nome do alimento)
      const combinedSuggestionsMap = new Map();
      localSuggestions.forEach(item => combinedSuggestionsMap.set(item.alimento.toLowerCase(), item));
      apiSuggestions.forEach(item => combinedSuggestionsMap.set(item.alimento.toLowerCase(), item));

      setSuggestions(Array.from(combinedSuggestionsMap.values()).slice(0, 10)); // Limita o total de sugestões
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erro ao buscar sugestões de alimentos:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Cria a versão "debounced" da função de busca
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300), // Espera 300ms após a última digitação
    [onSearchFood, foodDatabase] // Dependências do useMemo
  );

  // useEffect para monitorar o searchTerm e chamar a busca debounced
  useEffect(() => {
    debouncedSearch(searchTerm);
    // Limpa o debounce ao desmontar o componente ou quando searchTerm muda
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  // Efeito para buscar sugestões quando o searchTerm muda
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Primeiro, filtra o foodDatabase local (rápido)
      const localSuggestions = foodDatabase.filter(item =>
        item.alimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limita para não sobrecarregar

      // Em seguida, chama a API de busca se a prop onSearchFood foi fornecida
      let apiSuggestions = [];
      if (onSearchFood) {
        try {
          // onSearchFood já retorna Promise<FoodItem[]>
          const remoteItems = await onSearchFood(searchTerm);
          // Mapeia os itens remotos para o formato FoodDatabaseItem para consistência
          apiSuggestions = remoteItems.map(item => ({
            id: item.id,
            alimento: item.alimento,
            alimento_normalizado: item.alimento.toLowerCase(), // Normaliza para busca local
            categoria: item.categoria,
            energia_kcal_100g: item.energia_kcal_100g || 0,
            proteina_g_100g: item.proteina_g_100g || 0,
            carboidrato_g_100g: item.carboidrato_g_100g || 0,
            lipidios_g_100g: item.lipidios_g_100g || 0,
            fibra_g_100g: item.fibra_g_100g || 0,
            medida_caseira_unidade: item.medida_caseira_unidade || '',
            medida_caseira_gramas_por_unidade: item.medida_caseira_gramas_por_unidade || 0,
          }));
        } catch (error) {
          console.error("Erro ao buscar alimentos na API:", error);
        }
      }

      // Combina e remove duplicatas (prioriza API se houver)
      const combinedSuggestions = [...apiSuggestions, ...localSuggestions];
      const uniqueSuggestions = Array.from(new Map(combinedSuggestions.map(item => [item.alimento.toLowerCase(), item])).values());

      setSuggestions(uniqueSuggestions.slice(0, 10)); // Limita o total de sugestões
      setShowSuggestions(true);
    };

    // Implementa um debounce para evitar muitas chamadas à API
    const handler = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Atraso de 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, foodDatabase, onSearchFood]); // Adicione onSearchFood como dependência

  // Efeito para preencher os campos quando um item é selecionado
  useEffect(() => {
    setNome(itemParaEditar.nome);
    setQuantidade(itemParaEditar.peso_g);
    setCategoria(itemParaEditar.categoria);
    setKcal(itemParaEditar.kcal);
    setProtein(itemParaEditar.protein);
    setCarbs(itemParaEditar.carbs);
    setFats(itemParaEditar.fats);
    setSearchTerm(itemParaEditar.nome); // Atualiza o searchTerm inicial
  }, [itemParaEditar]);

  const handleSave = () => {
    const itemAtualizado = {
      ...itemParaEditar, // Mantém as propriedades originais
      nome: searchTerm, // Usa o searchTerm final como nome
      quantidade_estimada_g: quantidade,
      calorias_estimadas: kcal,
      categoria: categoria,
      peso_g: quantidade,
      kcal: kcal,
      protein: protein,
      carbs: carbs,
      fats: fats,
      medida_caseira_sugerida: medidaCaseiraSugerida,
      confianca: 'corrigido', // Marca como corrigido pelo usuário
    };
    onSave(itemAtualizado);
    onClose();
  };

  const handleSuggestionClick = (itemSelecionado) => {
    setNome(itemSelecionado.alimento); // Atualiza o nome principal
    setSearchTerm(itemSelecionado.alimento); // Atualiza o termo de busca para limpar a lista
    setCategoria(itemSelecionado.categoria || 'Outros');

    // Se o item selecionado tem dados nutricionais, preenche-os
    if (itemSelecionado.energia_kcal_100g) {
      const newKcal = (itemSelecionado.energia_kcal_100g * quantidade) / 100;
      setKcal(Math.round(newKcal));
      setProtein((itemSelecionado.proteina_g_100g * quantidade) / 100);
      setCarbs((itemSelecionado.carboidrato_g_100g * quantidade) / 100);
      setFats((itemSelecionado.lipidios_g_100g * quantidade) / 100);
    } else {
      // Se não tem dados nutricionais (ex: veio do foodDatabase local sem todos os campos),
      // pode-se manter os valores atuais ou zerar para o usuário preencher.
      // Por enquanto, vamos zerar para indicar que precisa de preenchimento manual ou IA.
      setKcal(0);
      setProtein(0);
      setCarbs(0);
      setFats(0);
    }

    // Preenche medida caseira se disponível
    setMedidaCaseiraSugerida(itemSelecionado.medida_caseira_unidade || '');
    // setGramasPorUnidade(itemSelecionado.medida_caseira_gramas_por_unidade || 0); // Se for usar para cálculo

    setShowSuggestions(false); // Esconde as sugestões
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Editar Alimento</h2>

        <div className="mb-4 relative"> {/* Adicione 'relative' para posicionar as sugestões */}
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do Alimento</label>
          <input
            type="text"
            id="nome"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={searchTerm} // Use searchTerm aqui
            onChange={(e) => {
              setSearchTerm(e.target.value); // Atualiza searchTerm
              // setNome(e.target.value); // Não atualize 'nome' diretamente aqui, ele será atualizado ao selecionar uma sugestão ou ao salvar
            }}
            onFocus={() => setShowSuggestions(true)} // Mostra sugestões ao focar
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Esconde sugestões ao desfocar (com delay para permitir clique)
          />

          {/* Indicador de carregamento */}
          {isLoadingSuggestions && searchTerm.length >= 2 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg p-2 text-center text-sm text-gray-500">
              Buscando...
            </div>
          )}

          {/* Lista de sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onMouseDown={() => handleSuggestionClick(item)} // onMouseDown para evitar o onBlur antes do clique
                >
                  <span className="font-medium text-gray-800">{item.alimento}</span>
                  {item.energia_kcal_100g && (
                    <span className="text-xs text-gray-500 ml-2">{item.energia_kcal_100g.toFixed(0)} kcal/100g</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">Quantidade (gramas)</label>
          <input
            type="number"
            id="quantidade"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={quantidade}
            onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <input
            type="text"
            id="categoria"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="kcal" className="block text-sm font-medium text-gray-700 mb-1">Calorias (kcal)</label>
          <input
            type="number"
            id="kcal"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={kcal.toFixed(0)}
            onChange={(e) => setKcal(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">Proteínas (g)</label>
            <input
              type="number"
              id="protein"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={protein.toFixed(1)}
              onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">Carboidratos (g)</label>
            <input
              type="number"
              id="carbs"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={carbs.toFixed(1)}
              onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="fats" className="block text-sm font-medium text-gray-700 mb-1">Gorduras (g)</label>
            <input
              type="number"
              id="fats"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={fats.toFixed(1)}
              onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-green-700 shadow-md"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

export default EditFoodModal;
