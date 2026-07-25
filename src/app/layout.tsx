import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { PatientProvider } from '@/context/PatientContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PediatriCode - Calculadora Pediátrica de Urgencias',
  description: 'Calculadora clínica de líquidos y electrólitos para urgencias pediátricas. Holliday-Segar, Parkland, CAD y Planes de la OMS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <PatientProvider>
          {children}
        </PatientProvider>
      </body>
    </html>
  );
}
