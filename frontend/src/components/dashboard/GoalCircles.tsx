// src/components/dashboard/DailyTotalsCircles.tsx
// (Salvo como GoalCircles.tsx, mas exportando DailyTotalsCircles)

import React from 'react';

// --- AJUSTE 1: Atualizar a Interface ---
// A interface agora corresponde ao schema do backend (dashboard.py)
interface DailyTotals {
  total_calorias: number;
  total_proteinas_g: number; // <-- Adicionado _g
  total_carboidratos_g: number; // <-- Adicionado _g
  total_gorduras_g: number; // <-- Adicionado _g
}

// Sub-componente para um único círculo (Sem alterações)
const TotalCircle = ({ label, value, unit, colors }) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${colors}`}>
        <span className="text-lg font-semibold">{value}</span>
        <span className="text-xs">{unit}</span>
      </div>
      <p className="mt-2 text-xs text-gray-700 font-medium">{label}</p>
    </div>
  );
};


// Componente principal que agrupa os círculos
const GoalCircles: React.FC<{ totals: DailyTotals }> = ({ totals }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-inner">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
        <TotalCircle
          label="Calorias"
          value={totals.total_calorias} // <-- OK
          unit="kcal"
          colors="bg-blue-50 text-blue-800"
        />
        {/* --- AJUSTE 2: Usar as props corretas --- */}
        <TotalCircle
          label="Proteínas"
          value={totals.total_proteinas_g} // <-- Adicionado _g
          unit="g"
          colors="bg-green-50 text-green-800"
        />
        <TotalCircle
          label="Carboidratos"
          value={totals.total_carboidratos_g} // <-- Adicionado _g
          unit="g"
          colors="bg-orange-50 text-orange-800"
        />
        <TotalCircle
          label="Gorduras"
          value={totals.total_gorduras_g} // <-- Adicionado _g
          unit="g"
          colors="bg-red-50 text-red-800"
        />
      </div>
    </div>
  );
};

export default GoalCircles;