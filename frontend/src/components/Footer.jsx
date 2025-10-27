export default function Footer() {
  return (
    <footer className="text-center text-sm text-gray-500 py-4 border-t mt-8">
      <p>&copy; {new Date().getFullYear()} Alimentação Equilibrada. Todos os direitos reservados.</p>
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <a href="/termos-uso" className="underline hover:text-gray-700">Termos de Uso</a>
        <a href="/politica-privacidade" className="underline hover:text-gray-700">Política de Privacidade</a>
        <a href="/politica-cookies" className="underline hover:text-gray-700">Política de Cookies</a>
      </div>
    </footer>
  );
}
