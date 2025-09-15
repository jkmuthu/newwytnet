import { ReactNode } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import PublicHeader from "./PublicHeader";
import PublicMobileLayout from "./PublicMobileLayout";
import Footer from "@/components/layout/footer";

interface PublicLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

/**
 * PublicLayout - Layout for public-facing pages (marketing, login, tools)
 * Features: Marketing navigation, login/signup buttons, no admin features
 */
export default function PublicLayout({ children, showFooter = true }: PublicLayoutProps) {
  const { isMobile } = useDeviceDetection();

  // Use mobile-specific layout for small screens
  if (isMobile) {
    return (
      <PublicMobileLayout showFooter={showFooter}>
        {children}
      </PublicMobileLayout>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}