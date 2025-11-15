// /components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-r from-green-50 to-blue-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Conteúdo principal do footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          
          {/* Coluna 1: Sobre */}
          <div>
            <h3 className="text-lg font-bold text-green-600 mb-3">NutrInfo</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sua jornada para uma alimentação saudável e equilibrada. 
              Informações nutricionais personalizadas com tecnologia e cuidado.
            </p>
          </div>

          {/* Coluna 2: Links Legais */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Informações Legais</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/termos-de-uso" 
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  href="/politica-de-privacidade" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  href="/politica-de-cookies" 
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-300 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <p className="text-xs text-gray-500 text-center md:text-left">
              &copy; {currentYear} <strong className="text-green-600">NutrInfo</strong>. 
              Todos os direitos reservados. | 
              <span className="ml-1">CPF: 104.195.578-22</span>
            </p>

            {/* Badge LGPD */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Conforme LGPD
              </span>
              
              <span className="text-xs text-gray-400">
                Versão 2.1
              </span>
            </div>
          </div>
        </div>

        {/* Aviso legal (pequeno) */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            As informações fornecidas neste aplicativo são apenas para fins educacionais e não substituem 
            orientação profissional de nutricionistas ou médicos. Consulte um profissional de saúde antes 
            de seguir qualquer plano alimentar.
          </p>
        </div>
      </div>
    </footer>
  );
}
