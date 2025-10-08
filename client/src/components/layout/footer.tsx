import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Github, Twitter, Linkedin, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
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
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api" },
    { label: "Status", href: "/status" },
  ];

  const wytHubsLinks = [
    { label: "AI Directory", href: "/ai-directory" },
    { label: "WytLife", href: "/wytlife" },
  ];

  const wytToolsLinks = [
    { label: "QR Generator", href: "/qr-generator" },
    { label: "DISC Assessment", href: "/assessment" },
    { label: "WytApps", href: "/wytapps" },
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
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main footer content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Company info - full width on mobile, spans 2 cols on large screens */}
        <div className="mb-8 lg:mb-12">
          <div className="lg:max-w-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md text-sm sm:text-base" data-testid="footer-description">
              Your all-in-one digital platform for a better lifestyle and smarter workstyle.
              ⚡ Speed. 🔒 Secure. 📈 Scale.
            </p>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                data-testid="social-facebook"
                onClick={() => window.open('https://www.facebook.com/WytNet', '_blank')}
              >
                <FaFacebook className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                data-testid="social-whatsapp"
                onClick={() => window.open('https://wa.me/918220449911', '_blank')}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="social-linkedin">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Links grid - optimized for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Company links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base" data-testid="footer-heading-company">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* WytHubs links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base" data-testid="footer-heading-wythubs">
              WytHubs
            </h3>
            <ul className="space-y-2">
              {wytHubsLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* WytTools links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base" data-testid="footer-heading-wyttools">
              WytTools
            </h3>
            <ul className="space-y-2">
              {wytToolsLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base" data-testid="footer-heading-resources">
              Resources
            </h3>
            <ul className="space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Access */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base" data-testid="footer-heading-platform">
              Platform Access
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/panel" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                  data-testid="footer-link-wytpanel"
                >
                  Access WytPanel
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                  data-testid="footer-link-wytpass"
                >
                  Get WytPass
                </a>
              </li>
              <li>
                <a 
                  href="/mobile-app" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                  data-testid="footer-link-mobile-app"
                >
                  Install Mobile App
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact information */}
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate" data-testid="contact-email">
                  info@wytnet.com
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400" data-testid="contact-phone">
                  +91 8220449911
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
              <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Address</p>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400" data-testid="contact-address">
                  Kamalam Ventures, Annanagar, Madurai - 625020
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-1 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
            <span data-testid="copyright-text">
              © {currentYear} WytNet. Made with
            </span>
            <Heart className="h-3 w-3 lg:h-4 lg:w-4 text-red-500 fill-current" />
            <span>for builders everywhere.</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
            {legalLinks.map((link, index) => (
              <a 
                key={link.label}
                href={link.href}
                className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                data-testid={`legal-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}