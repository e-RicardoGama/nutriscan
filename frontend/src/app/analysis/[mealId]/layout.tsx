// src/app/analysis/[mealId]/layout.tsx
export function generateStaticParams() {
  return [{ mealId: 'preview' }]; 
}

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}