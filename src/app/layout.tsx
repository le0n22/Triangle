

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/context/theme-provider';
import { LanguageProvider } from '@/context/language-provider';
import { CurrencyProvider } from '@/context/CurrencyProvider'; // New import

export const metadata: Metadata = {
  title: 'OrderFlow - Restaurant POS',
  description: 'Efficient Table-Based Restaurant POS System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            defaultTheme="dark" 
            storageKey="orderflow-theme"
        >
          <LanguageProvider>
            <CurrencyProvider> {/* Wrap with CurrencyProvider */}
              {children}
              <Toaster />
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
