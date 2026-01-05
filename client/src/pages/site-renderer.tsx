import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Globe, AlertCircle } from "lucide-react";

interface SitePage {
  id: string;
  title: string;
  slug: string;
  path: string;
  content: any[];
  showInNav: boolean;
  navOrder: number;
  isHomePage?: boolean;
}

interface UserSite {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  seoSettings: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

interface BlockData {
  type: string;
  id: string;
  data: any;
}

function HeroBlock({ data }: { data: any }) {
  return (
    <section 
      className="py-20 px-4 text-center text-white"
      style={{
        background: data.backgroundType === 'gradient' 
          ? data.backgroundGradient 
          : data.backgroundColor || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{data.title}</h1>
        {data.subtitle && (
          <p className="text-xl md:text-2xl opacity-90 mb-8">{data.subtitle}</p>
        )}
        {data.buttonText && (
          <a 
            href={data.buttonLink || '#'}
            className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {data.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: any }) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && (
          <h2 className="text-3xl font-bold text-center mb-12">{data.title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.features?.map((feature: any, index: number) => (
            <div key={index} className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: any }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {data.title && (
          <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
        )}
        <div className="prose prose-lg max-w-none">
          {data.content}
        </div>
      </div>
    </section>
  );
}

function ServicesBlock({ data }: { data: any }) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {data.title && (
          <h2 className="text-3xl font-bold text-center mb-12">{data.title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.services?.map((service: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {service.price && (
                <p className="text-lg font-bold text-indigo-600">{service.price}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ data }: { data: any }) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        {data.title && (
          <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
        )}
        {data.subtitle && (
          <p className="text-gray-600 mb-8">{data.subtitle}</p>
        )}
        <div className="space-y-4">
          {data.email && (
            <p className="text-lg">
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${data.email}`} className="text-indigo-600 hover:underline">
                {data.email}
              </a>
            </p>
          )}
          {data.phone && (
            <p className="text-lg">
              <span className="font-semibold">Phone:</span> {data.phone}
            </p>
          )}
          {data.address && (
            <p className="text-lg">
              <span className="font-semibold">Address:</span> {data.address}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function renderBlock(block: BlockData, index: number) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock key={block.id || index} data={block.data} />;
    case 'features':
      return <FeaturesBlock key={block.id || index} data={block.data} />;
    case 'text':
      return <TextBlock key={block.id || index} data={block.data} />;
    case 'services':
      return <ServicesBlock key={block.id || index} data={block.data} />;
    case 'contact':
      return <ContactBlock key={block.id || index} data={block.data} />;
    default:
      return null;
  }
}

export default function SiteRenderer() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const pageSlug = params.slug as string || 'home';

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/wytsite/public', subdomain, pageSlug],
    queryFn: async () => {
      const url = pageSlug && pageSlug !== 'home'
        ? `/api/wytsite/public/${subdomain}/${pageSlug}`
        : `/api/wytsite/public/${subdomain}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Site not found');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600">
            The site you're looking for doesn't exist or is not published.
          </p>
        </div>
      </div>
    );
  }

  const site: UserSite = data.site;
  const pages: SitePage[] = data.pages || [];
  const currentPage: SitePage = data.page || pages.find(p => p.isHomePage) || pages[0];
  const navigation = data.navigation || pages.filter(p => p.showInNav);

  const theme = site.theme || {};
  const primaryColor = theme.primaryColor || '#6366f1';

  return (
    <div className="min-h-screen" style={{ fontFamily: theme.fontFamily || 'Inter, sans-serif' }}>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href={`/site/${subdomain}`} className="text-xl font-bold" style={{ color: primaryColor }}>
            {site.name}
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((page: SitePage) => (
              <a
                key={page.id}
                href={`/site/${subdomain}${page.path === '/' ? '' : page.path}`}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                  currentPage?.slug === page.slug ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                {page.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {currentPage?.content?.map((block: BlockData, index: number) => 
          renderBlock(block, index)
        )}
        {(!currentPage?.content || currentPage.content.length === 0) && (
          <div className="py-20 text-center text-gray-500">
            <p>This page has no content yet.</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built with <a href="/" className="text-indigo-400 hover:underline">WytSite</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
