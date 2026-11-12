import type {Metadata} from 'next';
import './globals.css';
import { TimeStoreProvider } from '@/context/time-store-context';
import { MainLayout } from '@/components/main-layout';

export const metadata: Metadata = {
  title: 'TimeWise',
  description: 'Track your tasks and manage your time.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#db2777" />
      </head>
      <body className="font-body antialiased">
        <TimeStoreProvider>
          <div className="flex min-h-screen">
            <MainLayout>{children}</MainLayout>
          </div>
        </TimeStoreProvider>
      </body>
    </html>
  );
}
