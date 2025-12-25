// frontend_nutri/src/components/alimentos/EditFoodModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Cpu, Database } from 'lucide-react';
import { debounce } from 'lodash';

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
  const [medidaCaseiraSugerida, setMedidaCaseiraSugerida] = useState(itemParaEditar.medida_caseira_sugerida || '');

  // Estados para o autocomplete
  const [searchTerm, setSearchTerm] = useState(itemParaEditar.nome);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');

  // Função de busca aprimorada que usa o novo endpoint
  const performSearch = async (term) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Evita buscar o mesmo termo repetidamente
    if (term === lastSearchTerm) {
      return;
    }
    
    setLastSearchTerm(term);
    setIsLoadingSuggestions(true);
    
    try {
      // 1. Primeiro busca no foodDatabase local (rápido)
      const localSuggestions = foodDatabase.filter(item =>
        item.alimento.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 3).map(item => ({
        ...item,
        origem: 'banco'
      }));

      let apiSuggestions = [];
      
      // 2. Busca no backend com IA (usando o novo endpoint)
      if (onSearchFood) {
        // Use o endpoint completo que inclui IA
        apiSuggestions = await onSearchFood(term, true);
      }

      // Combina e remove duplicatas
      const combinedSuggestionsMap = new Map();
      
      // Adiciona sugestões locais
      localSuggestions.forEach(item => {
        combinedSuggestionsMap.set(item.alimento.toLowerCase(), item);
      });
      
      // Adiciona sugestões da API (priorizando as da IA se não houver do banco)
      apiSuggestions.forEach(item => {
        const key = item.alimento.toLowerCase();
        if (!combinedSuggestionsMap.has(key)) {
          combinedSuggestionsMap.set(key, {
            ...item,
            origem: item.id === 0 ? 'ia' : 'banco' // ID 0 indica que veio da IA
          });
        }
      });

      const finalSuggestions = Array.from(combinedSuggestionsMap.values())
        .slice(0, 8); // Limita o total

      setSuggestions(finalSuggestions);
      setShowSuggestions(true);
      
    } catch (error) {
      console.error("Erro ao buscar sugestões de alimentos:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce para a busca
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 400),
    [onSearchFood, foodDatabase, lastSearchTerm]
  );

  // Efeito para monitorar o searchTerm
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  // Efeito para preencher campos iniciais
  useEffect(() => {
    setNome(itemParaEditar.nome);
    setQuantidade(itemParaEditar.peso_g);
    setCategoria(itemParaEditar.categoria);
    setKcal(itemParaEditar.kcal);
    setProtein(itemParaEditar.protein);
    setCarbs(itemParaEditar.carbs);
    setFats(itemParaEditar.fats);
    setMedidaCaseiraSugerida(itemParaEditar.medida_caseira_sugerida || '');
    setSearchTerm(itemParaEditar.nome);
  }, [itemParaEditar]);

  const handleSave = () => {
    const itemAtualizado = {
      ...itemParaEditar,
      nome: searchTerm,
      quantidade_estimada_g: quantidade,
      calorias_estimadas: kcal,
      categoria: categoria,
      peso_g: quantidade,
      kcal: kcal,
      protein: protein,
      carbs: carbs,
      fats: fats,
      medida_caseira_sugerida: medidaCaseiraSugerida,
      confianca: 'corrigido',
    };
    onSave(itemAtualizado);
    onClose();
  };

  const handleSuggestionClick = (itemSelecionado) => {
    setNome(itemSelecionado.alimento);
    setSearchTerm(itemSelecionado.alimento);
    setCategoria(itemSelecionado.categoria || 'Outros');
    setMedidaCaseiraSugerida(itemSelecionado.medida_caseira_unidade || '');

    // Preenche automaticamente os dados nutricionais baseados na quantidade
    if (itemSelecionado.energia_kcal_100g) {
      const fator = quantidade / 100;
      setKcal(Math.round(itemSelecionado.energia_kcal_100g * fator));
      setProtein(parseFloat((itemSelecionado.proteina_g_100g * fator).toFixed(1)));
      setCarbs(parseFloat((itemSelecionado.carboidrato_g_100g * fator).toFixed(1)));
      setFats(parseFloat((itemSelecionado.lipidios_g_100g * fator).toFixed(1)));
    } else {
      // Se não tem dados nutricionais, zera para o usuário preencher
      setKcal(0);
      setProtein(0);
      setCarbs(0);
      setFats(0);
    }

    setShowSuggestions(false);
  };

  // Atualiza cálculos quando a quantidade muda
  useEffect(() => {
    if (suggestions.length > 0 && searchTerm === nome) {
      const itemCorrente = suggestions.find(s => s.alimento.toLowerCase() === nome.toLowerCase());
      if (itemCorrente && itemCorrente.energia_kcal_100g) {
        const fator = quantidade / 100;
        setKcal(Math.round(itemCorrente.energia_kcal_100g * fator));
        setProtein(parseFloat((itemCorrente.proteina_g_100g * fator).toFixed(1)));
        setCarbs(parseFloat((itemCorrente.carboidrato_g_100g * fator).toFixed(1)));
        setFats(parseFloat((itemCorrente.lipidios_g_100g * fator).toFixed(1)));
      }
    }
  }, [quantidade, nome, suggestions, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
          {itemParaEditar.nome ? 'Editar Alimento' : 'Adicionar Alimento'}
        </h2>

        {/* Campo de busca com autocomplete */}
        <div className="mb-4 relative">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Alimento
          </label>
          <div className="relative">
            <input
              type="text"
              id="nome"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Digite o nome do alimento..."
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          </div>

          {/* Indicador de carregamento */}
          {isLoadingSuggestions && searchTerm.length >= 2 && (
            <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg p-3 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                Buscando no banco de dados e IA...
              </div>
            </div>
          )}

          {/* Lista de sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
              {suggestions.map((item) => (
                <li
                  key={`${item.id}-${item.origem}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onMouseDown={() => handleSuggestionClick(item)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.alimento}</span>
                        {item.origem === 'ia' && (
                          <Cpu size={14} className="text-purple-600" title="Gerado por IA" />
                        )}
                        {item.origem === 'banco' && item.id > 0 && (
                          <Database size={14} className="text-blue-600" title="Do banco de dados" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.categoria}
                        {item.energia_kcal_100g && (
                          <span> • {item.energia_kcal_100g.toFixed(0)} kcal/100g</span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Mensagem quando não encontra resultados */}
          {showSuggestions && !isLoadingSuggestions && searchTerm.length >= 2 && suggestions.length === 0 && (
            <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg p-3 text-center text-sm text-gray-500">
              Nenhum alimento encontrado. Tente outro termo.
            </div>
          )}
        </div>

        {/* Demais campos do formulário (mantidos iguais) */}
        <div className="mb-4">
          <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade (gramas)
          </label>
          <input
            type="number"
            id="quantidade"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={quantidade}
            onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <input
            type="text"
            id="categoria"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ex: Fruta, Proteína, Cereal..."
          />
        </div>

        <div className="mb-4">
          <label htmlFor="medidaCaseira" className="block text-sm font-medium text-gray-700 mb-1">
            Medida Caseira Sugerida
          </label>
          <input
            type="text"
            id="medidaCaseira"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={medidaCaseiraSugerida}
            onChange={(e) => setMedidaCaseiraSugerida(e.target.value)}
            placeholder="Ex: 1 xícara, 2 colheres..."
          />
        </div>

        <div className="mb-4">
          <label htmlFor="kcal" className="block text-sm font-medium text-gray-700 mb-1">
            Calorias (kcal)
          </label>
          <input
            type="number"
            id="kcal"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            value={kcal.toFixed(0)}
            onChange={(e) => setKcal(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
              Proteínas (g)
            </label>
            <input
              type="number"
              id="protein"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={protein.toFixed(1)}
              onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
              Carboidratos (g)
            </label>
            <input
              type="number"
              id="carbs"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={carbs.toFixed(1)}
              onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label htmlFor="fats" className="block text-sm font-medium text-gray-700 mb-1">
              Gorduras (g)
            </label>
            <input
              type="number"
              id="fats"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={fats.toFixed(1)}
              onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
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