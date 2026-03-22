import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fraud Detection Intelligence',
  description: 'Real-time transactional fraud monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white selection:bg-orange-500/30">
        {children}
      </body>
    </html>
  );
}
