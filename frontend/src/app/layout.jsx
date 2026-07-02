import './globals.css';

export const metadata = {
  title: 'Portfolio — Shopify & E-commerce Developer',
  description:
    'Futuristic portfolio showcasing premium Shopify stores and e-commerce projects built with passion for design and performance.',
  keywords: ['Shopify', 'E-commerce', 'Web Developer', 'Portfolio', 'Liquid', 'Frontend'],
  authors: [{ name: 'Portfolio' }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Portfolio — Shopify & E-commerce Developer',
    description: 'Futuristic portfolio showcasing premium Shopify stores.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
