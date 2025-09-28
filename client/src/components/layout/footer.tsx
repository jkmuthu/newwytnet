import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Github, Twitter, Linkedin, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { FaFacebook } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ];

  const productLinks = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Install App", href: "/mobile-app" },
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Status", href: "/status" },
    { label: "Community", href: "/community" },
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
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md" data-testid="footer-description">
              Your all-in-one digital platform for a better lifestyle and smarter workstyle.
              ⚡ Speed. 🔒 Secure. 📈 Scale.
              Start instantly with simple, powerful tools that boost your productivity — no complicated setup.
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

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4" data-testid="footer-heading-company">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4" data-testid="footer-heading-product">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4" data-testid="footer-heading-support">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact information */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="contact-email">
                  info@wytnet.com
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="contact-phone">
                  +91 8220449911
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="contact-address">
                  Kamalam Ventures, Annanagar, Madurai - 625020
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <span data-testid="copyright-text">
              © {currentYear} WytNet. Made with
            </span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for builders everywhere.</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {legalLinks.map((link, index) => (
              <a 
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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