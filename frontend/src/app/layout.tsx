import './globals.css';

export const metadata = {
  title: 'Sublime Pés',
  description:
    'Agendamento online para cuidados profissionais em podologia, estética dos pés e bem-estar.',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
