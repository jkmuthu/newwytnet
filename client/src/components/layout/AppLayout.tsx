import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import Header from './header';
import Footer from './footer';
import MobileNavigation from './MobileNavigation';
import MobileBottomNavigation from './MobileBottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isMobile } = useDeviceDetection();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MobileNavigation />
        <main className="min-h-screen pb-20">
          {children}
        </main>
        <MobileBottomNavigation />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}