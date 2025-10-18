import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface ContextAwareLogoProps {
  context?: "engine" | "hub" | "public";
  className?: string;
  href?: string;
}

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  label: string;
  description: string | null;
  isPublic: boolean;
  isEditable: boolean;
}

interface SettingsResponse {
  success: boolean;
  settings: PlatformSetting[];
}

export default function ContextAwareLogo({ 
  context = "public", 
  className = "h-8 w-auto", 
  href = "/" 
}: ContextAwareLogoProps) {
  // Fetch public platform settings (logo URLs are marked as public)
  const { data } = useQuery<SettingsResponse>({
    queryKey: ['/api/platform-settings/public'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Determine which logo to use based on context
  const logoKey = context === "engine" 
    ? "engine_logo_url" 
    : context === "hub" 
      ? "hub_logo_url" 
      : "public_logo_url";

  // Find the logo URL from settings
  const logoSetting = data?.settings?.find(s => s.key === logoKey);
  const logoUrl = logoSetting?.value || "/wytnet-logo.png"; // Fallback to default

  return (
    <Link href={href} data-testid="link-logo">
      <img 
        src={logoUrl} 
        alt="Logo" 
        className={`transition-transform hover:scale-105 ${className}`}
      />
    </Link>
  );
}
