import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * RootLayout Component
 * 
 * Wraps all pages with consistent header and footer.
 * The Outlet renders the current page content between them.
 */
export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
