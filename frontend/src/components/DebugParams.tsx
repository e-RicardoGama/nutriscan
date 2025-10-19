// src/components/DebugParams.tsx
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DebugParams() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    console.log('=== DEBUG PARAMS ===');
    console.log('URL completa:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Tem bypass-sw?:', searchParams.has('bypass-sw'));
    console.log('Todos params:', Object.fromEntries(searchParams.entries()));
    console.log('=== FIM DEBUG ===');
  }, [searchParams]);

  return null;
}