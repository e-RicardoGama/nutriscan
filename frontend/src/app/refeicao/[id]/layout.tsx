// src/app/refeicao/[id]/layout.tsx
export function generateStaticParams() {
  return [{ id: '1' }]; // Um ID fictício apenas para o build passar
}

export default function RefeicaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}