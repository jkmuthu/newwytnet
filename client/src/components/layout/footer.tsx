import { Button } from "@/components/ui/button";
import { Heart, Linkedin, MessageCircle } from "lucide-react";
import { FaFacebook } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  const resourcesLinks = [
    { label: "Help Center", href: "/help" },
  ];

  const wytHubsLinks = [
    { label: "AI Directory", href: "/ai-directory" },
    { label: "WytLife", href: "/wytlife" },
  ];

  const wytAppsLinks = [
    { label: "QR Generator", href: "/qr-generator" },
    { label: "DISC Assessment", href: "/assessment" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 border-t border-gray-200 dark:border-gray-800">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-100/20 dark:to-blue-900/10 pointer-events-none"></div>
      
      {/* Main footer content */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Company info - full width on mobile, spans 2 cols on large screens */}
        <div className="mb-12 lg:mb-16">
          <div className="lg:max-w-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className="h-10 w-auto transition-transform hover:scale-105"
              />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-lg text-base sm:text-lg font-medium" data-testid="footer-description">
              Your all-in-one digital platform for a better lifestyle and smarter workstyle.
            </p>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                ⚡ Speed
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                🔒 Secure
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                📈 Scale
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all"
                data-testid="social-facebook"
                onClick={() => window.open('https://www.facebook.com/WytNet', '_blank')}
              >
                <FaFacebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-400 transition-all"
                data-testid="social-whatsapp"
                onClick={() => window.open('https://wa.me/918220449911', '_blank')}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all"
                data-testid="social-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Links grid - optimized for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Company links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base" data-testid="footer-heading-company">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* WytHubs links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base" data-testid="footer-heading-wythubs">
              WytHubs
            </h3>
            <ul className="space-y-3">
              {wytHubsLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* WytApps links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base" data-testid="footer-heading-wytapps">
              WytApps
            </h3>
            <ul className="space-y-3">
              {wytAppsLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base" data-testid="footer-heading-resources">
              Resources
            </h3>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Access */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base" data-testid="footer-heading-platform">
              Platform Access
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/panel" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                  data-testid="footer-link-wytpanel"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Access WytPanel</span>
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                  data-testid="footer-link-wytpass"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Get WytPass</span>
                </a>
              </li>
              <li>
                <a 
                  href="/mobile-app" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center group"
                  data-testid="footer-link-mobile-app"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Install Mobile App</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t-2 border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        {/* Bottom footer */}
        <div className="relative px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <span data-testid="copyright-text" className="font-medium">
                © {currentYear} WytNet. Made with
              </span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span className="font-medium">for individuals and businesses everywhere.</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
              {legalLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap font-medium"
                  data-testid={`legal-link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}