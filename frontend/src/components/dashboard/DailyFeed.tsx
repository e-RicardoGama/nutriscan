// src/components/dashboard/DailyFeed.tsx
import React from 'react';
import Image from 'next/image';
import { Plus, ImageIcon, Eye } from 'lucide-react'; // Adicionado 'Eye' para o botão de análise

export interface MealSummaryUI {
  id: number;
  tipo?: string; // o tipo/categoria do front (p.ex. "Almoço") ou nome de exibição
  kcal_estimadas?: number;
  imagem_url?: string | null;
  // Campos opcionais que podem vir do backend ou do enriquecimento:
  proteinas_g?: number | null;
  carboidratos_g?: number | null;
  gorduras_g?: number | null;
  // lista de alimentos principais (opcional) para sugestão de nome
  alimentos_principais?: string[];
  suggested_name?: string; // opcional: nome sugerido já pronto
}

const DailyFeed: React.FC<{
  meals: MealSummaryUI[];
  onAddMealClick: () => void;
  onViewMealClick?: (mealId: number) => void; // ao clicar na imagem abre análise
  onMealClick?: (mealId: number) => void; // clique no card inteiro (detalhes)
}> = ({ meals, onAddMealClick, onViewMealClick, onMealClick }) => {

  // componente que exibe macros (com fallback)
  const MacrosRow: React.FC<{ p?: number | null; c?: number | null; f?: number | null }> = ({ p, c, f }) => {
    const any = (val?: number | null) => (typeof val === 'number');
    if (!any(p) && !any(c) && !any(f)) {
      return <p className="text-sm text-gray-500">(Macros após análise)</p>;
    }
    return (
      <div className="flex gap-3 text-xs text-gray-600 mt-1">
        {any(p) && <span>🥚 {p!.toFixed(1)}g</span>}
        {any(c) && <span>🍞 {c!.toFixed(1)}g</span>}
        {any(f) && <span>🥑 {f!.toFixed(1)}g</span>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {meals.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold text-gray-700 mb-4">Nenhuma refeição registrada hoje</p>
          <button
            onClick={onAddMealClick}
            aria-label="Adicionar primeira refeição"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus /> Adicionar primeira refeição
          </button>
        </div>
      ) : (
        meals.map(meal => (
          <div
            key={meal.id}
            className="flex items-start bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition" // Removido cursor-pointer e onClick aqui
          >
            {/* Imagem: agora não é clicável para análise */}
            <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
              {meal.imagem_url ? (
                // A imagem não tem mais um onClick para análise
                <Image
                  src={meal.imagem_url}
                  alt={meal.tipo ? `${meal.tipo} — foto da refeição` : `Foto da refeição ${meal.id}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={36} />
                </div>
              )}
            </div>

            <div className="ml-4 flex-1">
              {/* Nome exibido: prioriza suggested_name, depois tipo */}
              <h4 className="font-semibold text-lg text-gray-800">
                {meal.suggested_name ?? meal.tipo ?? 'Refeição'}
              </h4>

              {/* Calorias */}
              <p className="text-gray-600">Aprox. {typeof meal.kcal_estimadas === 'number' ? `${meal.kcal_estimadas} kcal` : '—'}</p>

              {/* Macros (proteínas, carbs, gorduras) */}
              <MacrosRow p={meal.proteinas_g ?? null} c={meal.carboidratos_g ?? null} f={meal.gorduras_g ?? null} />

              {/* Novo botão para Ver Análise Detalhada */}
              {onViewMealClick && (
                <button
                  onClick={() => onViewMealClick(meal.id)}
                  className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  aria-label={`Ver análise detalhada da refeição ${meal.id}`}
                >
                  <Eye size={16} /> Ver Análise
                </button>
              )}

              {/* Se você quiser o card inteiro clicável para outros detalhes, pode adicionar aqui */}
              {onMealClick && (
                <button
                  onClick={() => onMealClick(meal.id)} // CORRIGIDO: Era 'onMealId', agora é 'onMealClick'
                  className="mt-2 ml-4 inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  aria-label={`Ver detalhes da refeição ${meal.id}`}
                >
                  Ver Detalhes
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DailyFeed;
