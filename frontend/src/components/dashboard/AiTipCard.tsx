// src/components/dashboard/AiTipCard.tsx

import React from 'react';
import { Lightbulb } from 'lucide-react';

// No futuro, você pode fazer fetch desta dica de uma API
const AiTipCard = () => {
  const dicaDoDia = "Lembre-se de incluir uma fonte de fibra no seu café da manhã, como aveia ou uma fruta, para ajudar na digestão e saciedade.";

  return (
    <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md border border-green-100">
      <div className="flex items-center mb-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h4 className="ml-2 font-semibold text-green-800">Dica Rápida da IA</h4>
      </div>
      <p className="text-sm text-gray-700">
        {dicaDoDia}
      </p>
    </div>
  );
};

export default AiTipCard;