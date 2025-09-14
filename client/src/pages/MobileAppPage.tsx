import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { 
  Download, 
  Smartphone, 
  Chrome, 
  Settings, 
  CheckCircle, 
  Code2, 
  FileCode,
  Zap,
  Shield,
  Share2,
  Clock,
  AlertCircle
} from "lucide-react";

interface APKMetadata {
  version: string;
  versionCode: number;
  size: number;
  sha256: string;
  buildTime: string;
  downloadUrl: string;
}

export default function MobileAppPage() {
  // Fetch APK metadata
  const { 
    data: apkData, 
    isLoading: isLoadingMetadata, 
    error: metadataError 
  } = useQuery<{ success: boolean; data: APKMetadata }>({
    queryKey: ['/api/mobile/latest'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handlePWAInstall = () => {
    // Check if running on mobile
    if (navigator.userAgent.match(/Android|iPhone|iPad/i)) {
      alert("Tap the menu button in your browser and select 'Add to Home screen' to install WytNet as an app!");
    } else {
      alert("Visit this page on your mobile device to install WytNet as an app!");
    }
  };

  const handleDirectAPKDownload = () => {
    window.location.href = '/downloads/wytnet-latest.apk';
  };

  const downloadBuildInstructions = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/android-build-instructions.md');
    element.setAttribute('download', 'wytnet-android-build-instructions.md');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Get WytNet Mobile App
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Access WytNet on your mobile device with full native app functionality.
          Choose between instant PWA installation or building a custom Android APK.
        </p>
      </div>

      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="download" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Direct Download
          </TabsTrigger>
          <TabsTrigger value="instant" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            PWA Install
          </TabsTrigger>
          <TabsTrigger value="build" className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Build Yourself
          </TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="space-y-6">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Download className="h-5 w-5" />
                Download Android APK
              </CardTitle>
              <CardDescription>
                Ready-to-install APK file built automatically from the latest WytNet code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingMetadata && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Loading APK information...
                  </AlertDescription>
                </Alert>
              )}

              {metadataError && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    APK is being built by our automated system. Check back in a few minutes!
                  </AlertDescription>
                </Alert>
              )}

              {apkData?.success && apkData.data && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-700">📦 APK Details:</h3>
                    <div className="text-sm space-y-1 text-blue-600">
                      <p><strong>Version:</strong> {apkData.data.version}</p>
                      <p><strong>Size:</strong> {formatFileSize(apkData.data.size)}</p>
                      <p><strong>Built:</strong> {formatDate(apkData.data.buildTime)}</p>
                      <p><strong>SHA-256:</strong> <code className="text-xs">{apkData.data.sha256.substring(0, 16)}...</code></p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-700">✅ What's Included:</h3>
                    <ul className="text-sm space-y-1 text-blue-600">
                      <li>• Complete authentication system</li>
                      <li>• All WytNet platform features</li>
                      <li>• Offline functionality</li>
                      <li>• Native Android integration</li>
                      <li>• Multi-tenant access</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ready to install!</strong> Use your existing WytNet account or create a new one after installation.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  onClick={handleDirectAPKDownload}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-download-apk"
                  disabled={!apkData?.success}
                >
                  <Download className="h-4 w-4" />
                  {isLoadingMetadata ? "Loading..." : "Download APK"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(apkData?.data?.sha256 || '')}
                  disabled={!apkData?.data?.sha256}
                  data-testid="button-copy-checksum"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Checksum
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instant" className="space-y-6">
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Smartphone className="h-5 w-5" />
                Install WytNet PWA (Recommended)
              </CardTitle>
              <CardDescription>
                Get the full app experience instantly without downloading anything
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700">✅ What you get:</h3>
                  <ul className="text-sm space-y-1 text-green-600">
                    <li>• Works offline with cached data</li>
                    <li>• Home screen icon & splash screen</li>
                    <li>• Full authentication system</li>
                    <li>• Installable app shortcuts</li>
                    <li>• Native app-like experience</li>
                    <li>• Auto-updates from web</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700">📱 Installation:</h3>
                  <div className="text-sm space-y-2 text-green-600">
                    <p><strong>Android Chrome/Edge:</strong></p>
                    <p>1. Tap menu (⋮) → "Add to Home screen"</p>
                    <p>2. Or look for install banner</p>
                    <p><strong>iPhone Safari:</strong></p>
                    <p>1. Tap Share → "Add to Home Screen"</p>
                  </div>
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ready to install!</strong> Use your existing WytNet account or create a new one after installation.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  onClick={handlePWAInstall}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  data-testid="button-install-pwa"
                >
                  <Smartphone className="h-4 w-4" />
                  Install PWA Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://wytnet.com', '_blank')}
                  data-testid="button-open-app"
                >
                  <Chrome className="h-4 w-4 mr-2" />
                  Open App
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="build" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Android APK Build System
              </CardTitle>
              <CardDescription>
                Build a native Android APK with Trusted Web Activity (TWA) wrapper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Configuration Ready
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <p>✅ TWA Config: twa-config.json</p>
                    <p>✅ Asset Links: .well-known/assetlinks.json</p>
                    <p>✅ PWA Manifest: manifest.json</p>
                    <p>✅ App Icons: 72px to 512px</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Build Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <p>📦 Package: com.wytnet.twa</p>
                    <p>🎯 Target: https://wytnet.com</p>
                    <p>🎨 Theme: #3b82f6 (Blue)</p>
                    <p>📱 Version: 1.0.0</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <p>🔐 Full authentication</p>
                    <p>📍 Location delegation</p>
                    <p>🔗 Custom URL handling</p>
                    <p>⚡ App shortcuts</p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Prerequisites:</strong> Node.js 16+, Java JDK 17+, Android SDK
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Quick Start Commands:</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span># Install bubblewrap CLI globally</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard('npm install -g @bubblewrap/cli')}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>npm install -g @bubblewrap/cli</div>
                  
                  <div className="flex justify-between items-center">
                    <span># Initialize TWA project</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard('npx @bubblewrap/cli init --manifest https://wytnet.com/manifest.json')}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>npx @bubblewrap/cli init --manifest https://wytnet.com/manifest.json</div>
                  
                  <div className="flex justify-between items-center">
                    <span># Build APK</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard('npx @bubblewrap/cli build')}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>npx @bubblewrap/cli build</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={downloadBuildInstructions}
                  className="flex items-center gap-2"
                  data-testid="button-download-instructions"
                >
                  <Download className="h-4 w-4" />
                  Download Full Instructions
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://wytnet.com/twa-config.json', '_blank')}
                  data-testid="button-view-config"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  View TWA Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Badge variant="outline" className="px-4 py-2">
          🚀 Both options provide the same powerful WytNet experience with authentication, assessments, and all features
        </Badge>
      </div>
    </div>
  );
}