import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Download, Share2, Copy, Smartphone, Globe, Mail, Wifi, QrCode, History, Zap, Palette, Settings, Eye, CheckCircle, Star } from "lucide-react";

interface QRHistory {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  dataUrl: string;
}

export default function QRGenerator() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QRHistory[]>([]);

  // QR Code Options
  const [qrType, setQrType] = useState('text');
  const [errorLevel, setErrorLevel] = useState('M');
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(4);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');

  // Content inputs
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      let content = '';
      
      switch (qrType) {
        case 'text':
          content = textContent;
          break;
        case 'url':
          content = urlContent.startsWith('http') ? urlContent : `https://${urlContent}`;
          break;
        case 'email':
          content = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          break;
        case 'phone':
          content = `tel:${phoneNumber}`;
          break;
        case 'sms':
          content = `sms:${smsNumber}?body=${encodeURIComponent(smsMessage)}`;
          break;
        case 'wifi':
          content = `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};;`;
          break;
        default:
          content = textContent;
      }

      if (!content.trim()) {
        toast({
          title: "Content Required",
          description: "Please enter content to generate QR code.",
          variant: "destructive",
        });
        return;
      }

      const options = {
        errorCorrectionLevel: errorLevel as 'L' | 'M' | 'Q' | 'H',
        type: 'image/png' as const,
        quality: 0.92,
        margin: margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        width: size,
      };

      const dataUrl = await QRCode.toDataURL(content, options);
      setQrDataUrl(dataUrl);

      // Add to history
      const newHistoryItem: QRHistory = {
        id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: qrType,
        content: content.length > 50 ? content.substring(0, 50) + '...' : content,
        timestamp: new Date(),
        dataUrl
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10

      toast({
        title: "QR Code Generated!",
        description: "Your QR code is ready to download or share.",
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${qrType}-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();

    toast({
      title: "Downloaded!",
      description: "QR code saved to your device.",
    });
  };

  const copyToClipboard = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      toast({
        title: "Copied!",
        description: "QR code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy QR code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareQR = async () => {
    if (!qrDataUrl || !navigator.share) {
      toast({
        title: "Share Not Supported",
        description: "Web Share API not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `qrcode-${qrType}.png`, { type: 'image/png' });

      await navigator.share({
        title: 'QR Code',
        text: `Generated QR code for ${qrType}`,
        files: [file],
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const loadFromHistory = (item: QRHistory) => {
    setQrDataUrl(item.dataUrl);
    toast({
      title: "Loaded from History",
      description: "QR code loaded successfully.",
    });
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      text: QrCode,
      url: Globe,
      email: Mail,
      phone: Smartphone,
      sms: Smartphone,
      wifi: Wifi,
    };
    const Icon = icons[type as keyof typeof icons] || QrCode;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-6">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              QR Code Generator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create stunning, professional QR codes with custom styling and advanced features. 
              Perfect for business cards, marketing materials, and digital experiences.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multiple Formats</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Custom Styling</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Instant Download</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Input */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-gray-200/50 dark:border-gray-700/50">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    QR Code Content & Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="qr-type" className="text-base font-semibold mb-3 block">Choose QR Code Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: 'text', icon: '📝', label: 'Plain Text', desc: 'Simple text content' },
                        { value: 'url', icon: '🌐', label: 'Website URL', desc: 'Direct web links' },
                        { value: 'email', icon: '📧', label: 'Email', desc: 'Contact via email' },
                        { value: 'phone', icon: '📞', label: 'Phone', desc: 'Call instantly' },
                        { value: 'sms', icon: '💬', label: 'SMS', desc: 'Text messages' },
                        { value: 'wifi', icon: '📶', label: 'WiFi', desc: 'Network access' },
                      ].map((type) => (
                        <div
                          key={type.value}
                          onClick={() => setQrType(type.value)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                            qrType === type.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Tabs value={qrType} onValueChange={setQrType}>
                    <TabsContent value="text" className="space-y-4">
                      <div>
                        <Label htmlFor="text-content">Text Content</Label>
                        <Textarea
                          id="text-content"
                          data-testid="input-text-content"
                          placeholder="Enter your text here..."
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4">
                      <div>
                        <Label htmlFor="url-content">Website URL</Label>
                        <Input
                          id="url-content"
                          data-testid="input-url-content"
                          placeholder="https://example.com"
                          value={urlContent}
                          onChange={(e) => setUrlContent(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="email" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email-to">Email Address</Label>
                          <Input
                            id="email-to"
                            data-testid="input-email-to"
                            placeholder="contact@example.com"
                            value={emailTo}
                            onChange={(e) => setEmailTo(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-subject">Subject</Label>
                          <Input
                            id="email-subject"
                            data-testid="input-email-subject"
                            placeholder="Email subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email-body">Message</Label>
                        <Textarea
                          id="email-body"
                          data-testid="input-email-body"
                          placeholder="Email message..."
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="phone" className="space-y-4">
                      <div>
                        <Label htmlFor="phone-number">Phone Number</Label>
                        <Input
                          id="phone-number"
                          data-testid="input-phone-number"
                          placeholder="+1234567890"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="sms" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sms-number">Phone Number</Label>
                          <Input
                            id="sms-number"
                            data-testid="input-sms-number"
                            placeholder="+1234567890"
                            value={smsNumber}
                            onChange={(e) => setSmsNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="sms-message">SMS Message</Label>
                        <Textarea
                          id="sms-message"
                          data-testid="input-sms-message"
                          placeholder="Your SMS message..."
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="wifi" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                          <Input
                            id="wifi-ssid"
                            data-testid="input-wifi-ssid"
                            placeholder="MyWiFiNetwork"
                            value={wifiSSID}
                            onChange={(e) => setWifiSSID(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="wifi-security">Security Type</Label>
                          <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                            <SelectTrigger data-testid="select-wifi-security">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WPA">WPA/WPA2</SelectItem>
                              <SelectItem value="WEP">WEP</SelectItem>
                              <SelectItem value="nopass">Open (No Password)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="wifi-password">Password</Label>
                        <Input
                          id="wifi-password"
                          data-testid="input-wifi-password"
                          type="password"
                          placeholder="WiFi password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-6" />
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-purple-600" />
                      <Label className="text-base font-semibold">Customization Options</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="error-level" className="text-sm font-medium">Error Correction Level</Label>
                          <Select value={errorLevel} onValueChange={setErrorLevel}>
                            <SelectTrigger data-testid="select-error-level" className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L">🟢 Low (7%) - Faster scan</SelectItem>
                              <SelectItem value="M">🟡 Medium (15%) - Balanced</SelectItem>
                              <SelectItem value="Q">🟠 Quartile (25%) - Reliable</SelectItem>
                              <SelectItem value="H">🔴 High (30%) - Most durable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="size" className="text-sm font-medium">Size (pixels)</Label>
                          <div className="mt-1">
                            <Input
                              id="size"
                              data-testid="input-size"
                              type="range"
                              min="128"
                              max="1024"
                              value={size}
                              onChange={(e) => setSize(Number(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>128px</span>
                              <span className="font-medium">{size}px</span>
                              <span>1024px</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="dark-color" className="text-sm font-medium">Foreground Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="dark-color"
                              data-testid="input-dark-color"
                              type="color"
                              value={darkColor}
                              onChange={(e) => setDarkColor(e.target.value)}
                              className="w-16 h-10 p-1 rounded-lg"
                            />
                            <Input
                              value={darkColor}
                              onChange={(e) => setDarkColor(e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="light-color" className="text-sm font-medium">Background Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="light-color"
                              data-testid="input-light-color"
                              type="color"
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              className="w-16 h-10 p-1 rounded-lg"
                            />
                            <Input
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              placeholder="#ffffff"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={generateQRCode} 
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    data-testid="button-generate-qr"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Generate QR Code
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* QR Code Preview & Actions */}
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50 dark:border-gray-700/50">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6 p-6">
                  {qrDataUrl ? (
                    <>
                      <div className="relative">
                        <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 rounded-2xl inline-block border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                          <img 
                            src={qrDataUrl} 
                            alt="Generated QR Code" 
                            className="max-w-full h-auto rounded-lg shadow-lg"
                            style={{ width: Math.min(size, 280) }}
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-2 shadow-lg">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          onClick={downloadQR}
                          className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                          data-testid="button-download-qr"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download High Quality
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            onClick={copyToClipboard}
                            variant="outline"
                            className="h-11 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
                            data-testid="button-copy-qr"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          
                          <Button 
                            onClick={shareQR}
                            variant="outline"
                            className="h-11 border-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300"
                            data-testid="button-share-qr"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto opacity-70">
                          <QrCode className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-300">Ready to generate</p>
                          <p className="text-sm text-muted-foreground">Fill in your content and click generate</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History */}
              {history.length > 0 && (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-200/50 dark:border-gray-700/50">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <History className="h-5 w-5 text-white" />
                      </div>
                      Recent QR Codes
                      <Badge variant="secondary" className="ml-auto">
                        {history.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    {history.map((item, index) => (
                      <div 
                        key={item.id}
                        className="group flex items-center gap-4 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => loadFromHistory(item)}
                        data-testid={`history-item-${item.id}`}
                      >
                        <div className="relative">
                          <img 
                            src={item.dataUrl} 
                            alt="QR Code" 
                            className="w-12 h-12 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
                          />
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                              <Star className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(item.type)}
                            <Badge variant="outline" className="text-xs font-medium">
                              {item.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {item.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} • {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}