// src/components/AccordionItem.tsx
"use client"; // Precisa disso pois usa hooks do React (onClick)

import React from 'react';
import { ChevronDown } from 'lucide-react'; // Ele precisa deste ícone

// Define a interface de Props aqui
type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  colorClasses: string;
};

// Seu código original colado aqui
const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick, colorClasses }) => {
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${colorClasses}`}>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-4 font-semibold text-left"
      >
        <span>{title}</span>
        <ChevronDown
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-700 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

// Exporte para que outros arquivos possam usá-lo
export default AccordionItem;