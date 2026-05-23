import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/blog/Header';
import Footer from '@/components/blog/Footer';

export const metadata: Metadata = {
  title: 'CinemaRant — Entertainment News, Reviews & Analysis',
  description: 'Your #1 source for movies, TV, gaming, music, and celebrity news. Breaking entertainment news and in-depth analysis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f7f7f7] text-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
