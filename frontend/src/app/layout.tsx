import './globals.css';

export const metadata = {
  title: 'Sunshine - Beauty Studio',
  description: 'Sistema de agendamento e gestão do espaço.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-KY22S1SVTD"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KY22S1SVTD');
            `,
          }}
        />
      </head>
      <body className="bg-[#F8F5F1] text-[#7A624D]">{children}</body>
    </html>
  );
}