
import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
