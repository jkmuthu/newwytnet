import { Button } from "@/components/ui/button";
import { Heart, Linkedin, MessageCircle, Sparkles } from "lucide-react";
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

  const wytAppsLinks = [
    { label: "WytLife", href: "/wytlife" },
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
    <footer className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 animate-gradient opacity-80" style={{ backgroundSize: '200% 200%' }}></div>
      
      {/* Floating orbs animation */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Main footer content */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        
        {/* Centered Company info */}
        <div className="mb-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-3 animate-fade-in-up">
            <img 
              src="/wytnet-logo.png?v=2" 
              alt="WytNet" 
              className="h-8 sm:h-10 w-auto transition-transform hover:scale-110 hover:rotate-3 animate-pulse-slow"
            />
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-spin-slow" />
          </div>
          
          <p className="text-white mb-3 max-w-2xl mx-auto text-sm sm:text-base font-semibold animate-fade-in-up animation-delay-100" data-testid="footer-description">
            Your all-in-one digital platform for a better lifestyle and smarter workstyle.
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap animate-fade-in-up animation-delay-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs sm:text-sm font-bold border-2 border-white/30 hover:bg-white/30 hover:scale-105 transition-all animate-bounce-slow">
              ⚡ Speed
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs sm:text-sm font-bold border-2 border-white/30 hover:bg-white/30 hover:scale-105 transition-all animate-bounce-slow animation-delay-100">
              🔒 Secure
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs sm:text-sm font-bold border-2 border-white/30 hover:bg-white/30 hover:scale-105 transition-all animate-bounce-slow animation-delay-200">
              📈 Scale
            </span>
          </div>
          
          <div className="flex items-center justify-center space-x-3 animate-fade-in-up animation-delay-300">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white hover:text-blue-600 hover:scale-110 hover:-rotate-12 transition-all duration-300"
              data-testid="social-facebook"
              onClick={() => window.open('https://www.facebook.com/WytNet', '_blank')}
            >
              <FaFacebook className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white hover:text-green-600 hover:scale-110 hover:rotate-12 transition-all duration-300"
              data-testid="social-whatsapp"
              onClick={() => window.open('https://wa.me/918220449911', '_blank')}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white hover:text-blue-600 hover:scale-110 hover:-rotate-12 transition-all duration-300"
              data-testid="social-linkedin"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="h-px w-full max-w-4xl mx-auto mb-4 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Company links */}
          <div className="animate-fade-in-up animation-delay-400">
            <h3 className="font-bold text-white mb-2 text-sm sm:text-base flex items-center gap-2" data-testid="footer-heading-company">
              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></span>
              Company
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-white/90 hover:text-white transition-all text-xs sm:text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* WytApps links */}
          <div className="animate-fade-in-up animation-delay-500">
            <h3 className="font-bold text-white mb-2 text-sm sm:text-base flex items-center gap-2" data-testid="footer-heading-wytapps">
              <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping"></span>
              WytApps
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {wytAppsLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-white/90 hover:text-white transition-all text-xs sm:text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div className="animate-fade-in-up animation-delay-600">
            <h3 className="font-bold text-white mb-2 text-sm sm:text-base flex items-center gap-2" data-testid="footer-heading-resources">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-ping"></span>
              Resources
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-white/90 hover:text-white transition-all text-xs sm:text-sm font-medium inline-flex items-center group"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Access */}
          <div className="col-span-2 sm:col-span-1 animate-fade-in-up animation-delay-700">
            <h3 className="font-bold text-white mb-2 text-sm sm:text-base flex items-center gap-2" data-testid="footer-heading-platform">
              <span className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping"></span>
              Platform Access
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <a 
                  href="/login" 
                  className="text-white/90 hover:text-white transition-all text-sm font-medium inline-flex items-center group"
                  data-testid="footer-link-join-wytnet"
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">Join WytNet</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a>
              </li>
              <li>
                <a 
                  href="/mobile-app" 
                  className="text-white/90 hover:text-white transition-all text-sm font-medium inline-flex items-center group"
                  data-testid="footer-link-mobile-app"
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">Install Mobile App</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t-2 border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-pink-400/10 to-cyan-400/10"></div>
        
        {/* Bottom footer */}
        <div className="relative px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-2 lg:space-y-0">
            <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-white/90 animate-fade-in">
              <span data-testid="copyright-text" className="font-medium">
                © {currentYear} WytNet. Made with
              </span>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 fill-current animate-heartbeat" />
              <span className="font-medium hidden sm:inline">for individuals and businesses everywhere.</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center animate-fade-in animation-delay-100">
              {legalLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href}
                  className="text-[10px] sm:text-xs text-white/80 hover:text-white transition-colors whitespace-nowrap font-medium hover:underline"
                  data-testid={`legal-link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: -2s;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: backwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: backwards;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: backwards;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
          animation-fill-mode: backwards;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: backwards;
        }
        .animation-delay-700 {
          animation-delay: 0.7s;
          animation-fill-mode: backwards;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
          animation-fill-mode: backwards;
        }
      `}</style>
    </footer>
  );
}
