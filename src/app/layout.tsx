import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Atlas – Productivity Suite',
  description:
    'Kanban, todos, and calendar in a clean productivity workspace built with Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-stone-950">
      <body
        className={`${inter.variable} bg-stone-100 text-stone-900 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
