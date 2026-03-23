import './globals.css';

export const metadata = {
  title: 'Flor de Lótus Podologia',
  description: 'Sistema de agendamento e gestão do espaço.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F8F5F1] text-[#7A624D]">{children}</body>
    </html>
  );
}