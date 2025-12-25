// src/components/Navbar.tsx - VERSÃO CORRIGIDA

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";

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
                  src="/imagens/logo.jpg"
                  alt="Logo Pratos Saudáveis"
                  width={150}
                  height={130}
                  priority={true}  // ← Adicione esta linha
                  className="object-contain"
                />

              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 sm:gap-3">
                {!usuario ? (
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => router.push("/registrar")}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Cadastrar
                    </button>
                  </>
                ) : (
                  <>
                    {/* ✅ Botão Home — só aparece se o usuário estiver autenticado */}
                    <button
                      onClick={() => router.push("/")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition text-sm font-medium"
                    >
                      Home
                    </button>

                    <button
                      onClick={onLogout || handleLogout}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Sair
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}