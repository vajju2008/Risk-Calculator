import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';

export const metadata: Metadata = {
  title: 'Position Size Calculator — Forex & Crypto Risk Management',
  description:
    'Professional position sizing and risk management calculator for forex and cryptocurrency trading. Calculate lot sizes, reward-to-risk ratios, and manage your trading risk with precision.',
  keywords: [
    'position size calculator',
    'forex calculator',
    'crypto trading',
    'risk management',
    'lot size calculator',
    'trading risk',
    'reward risk ratio',
  ],
};

export default function Home() {
  return (
    <main>
      <Calculator />
      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem 0',
          color: '#888',
          fontSize: '0.9rem',
          borderTop: '1px solid #2a2a2a',
          marginTop: '2rem',
          letterSpacing: '0.05em',
        }}
      >
        Done By <span style={{ color: '#fff', fontWeight: 600 }}>Vatsal</span>
      </footer>
    </main>
  );
}
