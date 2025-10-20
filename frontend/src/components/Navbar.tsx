// src/components/Navbar.tsx - VERSÃO CORRIGIDA

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import { Sun, Sunset, Moon } from "lucide-react";

type NavbarProps = {
  onLogout?: () => void;
};

export default function Navbar({ onLogout }: NavbarProps) {
  const router = useRouter();
  const { usuario, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  let saudacao = "";
  let iconeSaudacao = null;

  if (usuario) {
    const hora = new Date().getHours();
    if (hora < 12) {
      saudacao = "Bom dia";
      iconeSaudacao = <Sun className="w-5 h-5" />;
    } else if (hora < 18) {
      saudacao = "Boa tarde";
      iconeSaudacao = <Sunset className="w-5 h-5" />;
    } else {
      saudacao = "Boa noite";
      iconeSaudacao = <Moon className="w-5 h-5" />;
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-transparent">
      {/* ✅ CORREÇÃO APLICADA AQUI: Adicionado padding para criar as "margens" */}
      <div className="w-full px-4 md:px-8 py-1">
        {/* Card padrão do app */}
        <div className="w-full bg-white shadow-md rounded-lg border-l-4 border-green-500">
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Logo + Saudação */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Image
                  src="/imagens/alimentacao.jpg?1"
                  alt="Logo Pratos Saudáveis"
                  width={30}
                  height={30}
                  priority={true}  // ← Adicione esta linha
                  className="object-contain"
                />
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                  <h1 className="text-lg md:text-xl font-bold text-green-800">
                    Análise Nutrientes
                  </h1>
                  {usuario && (
                    <span className="text-xs md:text-sm font-semibold text-green-800 flex items-center gap-1">
                      {saudacao}, {usuario.nome} {iconeSaudacao}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 sm:gap-3">
                {!usuario ? (
                  <>
                    <button
                      onClick={() => router.push("/auth")}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => router.push("/cadastro")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Cadastrar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onLogout || handleLogout}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Sair
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}