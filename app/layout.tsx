import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Position Size Calculator — Forex & Crypto Risk Management',
  description:
    'Professional position sizing and risk management calculator for forex and cryptocurrency trading.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
