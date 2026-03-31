import type { Metadata } from 'next';
import { Unbounded, Golos_Text } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/components/AuthProvider';

const golos = Golos_Text({ subsets: ['latin', 'cyrillic'], variable: '--font-body' });
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], variable: '--font-heading' });

export const metadata: Metadata = {
  metadataBase: new URL('https://stroy.kg'),
  title: {
    default: 'Stroy.kg — Всё для стройки в одном месте',
    template: '%s | Stroy.kg',
  },
  description: 'Маркетплейс строительных услуг и материалов в Кыргызстане. Найдите поставщиков, стройматериалы и услуги в Бишкеке.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://stroy.kg',
    siteName: 'Stroy.kg',
    title: 'Stroy.kg — Всё для стройки в одном месте',
    description: 'Маркетплейс строительных услуг и материалов в Кыргызстане',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${unbounded.variable}`}>
      <body className="bg-background text-[#1A1A2E] font-body min-h-screen pb-20 md:pb-0 antialiased selection:bg-primary/20">
        <AuthProvider>
          <Header />
          {children}
          <Navigation />
        </AuthProvider>
      </body>
    </html>
  );
}
