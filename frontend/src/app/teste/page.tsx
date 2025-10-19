// src/app/teste/page.tsx
'use client';
import { useEffect } from 'react';

export default function TestePage() {
  useEffect(() => {
    console.log('✅ Página de teste carregada com sucesso!');
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">✅ Página de Teste</h1>
      <p>Se você está vendo isso, a página carregou normalmente.</p>
    </div>
  );
}