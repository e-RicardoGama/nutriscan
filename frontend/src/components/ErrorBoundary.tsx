// src/components/ErrorBoundary.tsx
'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Erro capturado:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-800">
          <h2 className="text-lg font-bold mb-2">Algo deu errado!</h2>
          <details className="mb-4">
            <summary className="cursor-pointer font-semibold">Detalhes do erro:</summary>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}