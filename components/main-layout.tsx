'use client';
import { useTimeStore } from '@/context/time-store-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { FloatingNav } from './floating-nav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { desk } = useTimeStore();

  return (
    <>
      {desk.floatingNav ? <FloatingNav /> : <Sidebar />}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          desk.floatingNav
            ? 'lg:ml-0'
            : 'lg:ml-0 data-[sidebar-collapsed=true]:lg:ml-[-192px]'
        }`}
      >
        <Header />
        {children}
      </div>
      <Toaster />
    </>
  );
}
