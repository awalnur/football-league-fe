import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navigation />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
