import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Download, Share2, Copy, Smartphone, Globe, Mail, Wifi, QrCode, History } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">QR Code Generator</h1>
            <p className="text-xl text-muted-foreground">
              Create custom QR codes for text, URLs, contact info, WiFi, and more
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Input */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="qr-type">QR Code Type</Label>
                    <Select value={qrType} onValueChange={setQrType}>
                      <SelectTrigger data-testid="select-qr-type">
                        <SelectValue placeholder="Select QR type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">📝 Plain Text</SelectItem>
                        <SelectItem value="url">🌐 Website URL</SelectItem>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="phone">📞 Phone Number</SelectItem>
                        <SelectItem value="sms">💬 SMS Message</SelectItem>
                        <SelectItem value="wifi">📶 WiFi Network</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="error-level">Error Correction</Label>
                      <Select value={errorLevel} onValueChange={setErrorLevel}>
                        <SelectTrigger data-testid="select-error-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (7%)</SelectItem>
                          <SelectItem value="M">Medium (15%)</SelectItem>
                          <SelectItem value="Q">Quartile (25%)</SelectItem>
                          <SelectItem value="H">High (30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="size">Size (px)</Label>
                      <Input
                        id="size"
                        data-testid="input-size"
                        type="number"
                        min="128"
                        max="1024"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dark-color">Dark Color</Label>
                      <Input
                        id="dark-color"
                        data-testid="input-dark-color"
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="light-color">Light Color</Label>
                      <Input
                        id="light-color"
                        data-testid="input-light-color"
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={generateQRCode} 
                    className="w-full"
                    data-testid="button-generate-qr"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* QR Code Preview & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Preview</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {qrDataUrl ? (
                    <>
                      <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                        <img 
                          src={qrDataUrl} 
                          alt="Generated QR Code" 
                          className="max-w-full h-auto"
                          style={{ width: Math.min(size, 300) }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <Button 
                          onClick={downloadQR}
                          className="w-full"
                          data-testid="button-download-qr"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={copyToClipboard}
                            variant="outline"
                            data-testid="button-copy-qr"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          
                          <Button 
                            onClick={shareQR}
                            variant="outline"
                            data-testid="button-share-qr"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Generate a QR code to see preview</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History */}
              {history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent QR Codes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => loadFromHistory(item)}
                        data-testid={`history-item-${item.id}`}
                      >
                        <img 
                          src={item.dataUrl} 
                          alt="QR Code" 
                          className="w-10 h-10 border rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <Badge variant="secondary" className="text-xs">
                              {item.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()}
                          </p>
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

      <Footer />
    </div>
  );
}