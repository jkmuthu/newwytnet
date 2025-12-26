import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import QRCode from "qrcode";
import { 
  Download, Share2, Copy, Smartphone, Globe, Mail, Wifi, QrCode, History, 
  Zap, Eye, CheckCircle, Star, Crown, Lock, Upload, Palette, Image as ImageIcon,
  CreditCard
} from "lucide-react";
import wytLogoPath from "@assets/Logo_003_1766709774257.jpg";

interface QRHistory {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  dataUrl: string;
}

interface AccessCheck {
  allowed: boolean;
  reason: string;
  balance?: number;
  cost?: number;
  subscriptionType?: string;
  plan?: any;
}

export default function QRGenerator() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QRHistory[]>([]);

  // QR Code Options
  const [qrType, setQrType] = useState('url');
  const [errorLevel, setErrorLevel] = useState('H');
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(4);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  
  // Premium features
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [useLogo, setUseLogo] = useState(true);
  const [exportSize, setExportSize] = useState(512);

  // Content inputs
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');

  // Check user's access level
  const { data: accessData, isLoading: accessLoading } = useQuery<AccessCheck>({
    queryKey: ['/api/qrcode/check-access'],
  });

  const isPremium = accessData?.subscriptionType === 'pay_per_use' || 
                    accessData?.subscriptionType === 'monthly' || 
                    accessData?.subscriptionType === 'yearly';
  
  // Free types: URL, Text only
  // Premium types: WhatsApp, WiFi, Email, SMS, Phone
  const freeTypes = ['url', 'text'];
  const premiumTypes = ['whatsapp', 'wifi', 'email', 'sms', 'phone'];
  
  const isTypeAvailable = (type: string) => {
    if (freeTypes.includes(type)) return true;
    if (premiumTypes.includes(type) && isPremium) return true;
    return false;
  };

  // Add logo to QR code
  const addLogoToQR = (qrDataUrl: string, logoSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const qrImage = new Image();
      qrImage.onload = () => {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0);
        
        // Load and draw logo
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = qrImage.width * 0.22;
          const logoX = (qrImage.width - logoSize) / 2;
          const logoY = (qrImage.height - logoSize) / 2;
          
          // White background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
          
          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          
          resolve(canvas.toDataURL('image/png'));
        };
        logo.onerror = () => {
          // If logo fails to load, just return original QR
          resolve(qrDataUrl);
        };
        logo.src = logoSrc;
      };
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
  };

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
        case 'whatsapp':
          const waNumber = whatsappNumber.replace(/[^0-9]/g, '');
          content = `https://wa.me/${waNumber}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`;
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

      // Check if premium type without subscription
      if (premiumTypes.includes(qrType) && !isPremium) {
        toast({
          title: "Premium Feature",
          description: "Please upgrade to Per-Use plan to use this QR type.",
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
          dark: isPremium ? darkColor : '#000000',
          light: isPremium ? lightColor : '#ffffff',
        },
        width: isPremium ? exportSize : 512,
      };

      let dataUrl = await QRCode.toDataURL(content, options);
      
      // Add logo if enabled
      if (useLogo) {
        const logoToUse = isPremium && customLogo ? customLogo : wytLogoPath;
        try {
          dataUrl = await addLogoToQR(dataUrl, logoToUse);
        } catch (logoError) {
          console.error('Logo overlay failed:', logoError);
        }
      }
      
      setQrDataUrl(dataUrl);

      // Add to history
      const newHistoryItem: QRHistory = {
        id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: qrType,
        content: content.length > 50 ? content.substring(0, 50) + '...' : content,
        timestamp: new Date(),
        dataUrl
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);

      toast({
        title: "QR Code Generated!",
        description: isPremium ? "Premium QR code ready with your custom options." : "QR code ready with Wyt branding.",
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
    link.download = `wytqrc-${qrType}-${Date.now()}.png`;
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
      const file = new File([blob], `wytqrc-${qrType}.png`, { type: 'image/png' });

      await navigator.share({
        title: 'WytQRC',
        text: `Generated QR code for ${qrType}`,
        files: [file],
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogo(reader.result as string);
        toast({
          title: "Logo Uploaded",
          description: "Your custom logo will be used in the QR code.",
        });
      };
      reader.readAsDataURL(file);
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
      whatsapp: Smartphone,
      wifi: Wifi,
    };
    const Icon = icons[type as keyof typeof icons] || QrCode;
    return <Icon className="h-4 w-4" />;
  };

  // QR Type definitions
  const qrTypes = [
    { value: 'url', icon: '🌐', label: 'Website', desc: 'Open links', premium: false },
    { value: 'text', icon: '📝', label: 'Text', desc: 'Plain text', premium: false },
    { value: 'whatsapp', icon: '💬', label: 'WhatsApp', desc: 'Send messages', premium: true },
    { value: 'phone', icon: '📞', label: 'Phone', desc: 'Call number', premium: true },
    { value: 'email', icon: '📧', label: 'Email', desc: 'Compose email', premium: true },
    { value: 'sms', icon: '💬', label: 'SMS', desc: 'Text message', premium: true },
    { value: 'wifi', icon: '📶', label: 'WiFi', desc: 'Connect network', premium: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              WytQRC - QR Code Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPremium ? (
                <span className="flex items-center justify-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Premium Access - All features unlocked
                </span>
              ) : (
                "Create QR codes with Wyt branding"
              )}
            </p>
          </div>

          {/* Plan Status Banner */}
          {!isPremium && (
            <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                      <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Free Plan</p>
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        URL & Text QR types with Wyt logo • Upgrade for more features
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => window.location.href = '/app/wytqrc'}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Per-Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Input */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Create QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* QR Type Selector */}
                  <div>
                    <Label htmlFor="qr-type" className="text-sm font-medium mb-3 block">Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {qrTypes.map((type) => {
                        const isLocked = type.premium && !isPremium;
                        return (
                          <div
                            key={type.value}
                            onClick={() => {
                              if (isLocked) {
                                toast({
                                  title: "Premium Feature",
                                  description: "Upgrade to Per-Use plan to unlock this QR type.",
                                  variant: "destructive",
                                });
                              } else {
                                setQrType(type.value);
                              }
                            }}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                              qrType === type.value && !isLocked
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                                : isLocked
                                  ? 'border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 opacity-60'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                            }`}
                          >
                            {isLocked && (
                              <div className="absolute top-2 right-2">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            {type.premium && !isLocked && (
                              <div className="absolute top-2 right-2">
                                <Crown className="h-3 w-3 text-yellow-500" />
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-2xl mb-2">{type.icon}</div>
                              <div className="font-medium text-sm">{type.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Input Based on Type */}
                  <Tabs value={qrType}>
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

                    <TabsContent value="whatsapp" className="space-y-4">
                      <div>
                        <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                        <Input
                          id="whatsapp-number"
                          data-testid="input-whatsapp-number"
                          placeholder="+1234567890 (with country code)"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp-message">Pre-filled Message (Optional)</Label>
                        <Textarea
                          id="whatsapp-message"
                          data-testid="input-whatsapp-message"
                          placeholder="Hello! I found your contact from..."
                          value={whatsappMessage}
                          onChange={(e) => setWhatsappMessage(e.target.value)}
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
                      </div>
                      <div>
                        <Label>Security Type</Label>
                        <div className="flex gap-4 mt-2">
                          {['WPA', 'WEP', 'nopass'].map((sec) => (
                            <label key={sec} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="wifi-security"
                                value={sec}
                                checked={wifiSecurity === sec}
                                onChange={(e) => setWifiSecurity(e.target.value)}
                                className="text-purple-500"
                              />
                              <span className="text-sm">{sec === 'nopass' ? 'None' : sec}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  {/* Premium Customization Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Customization
                      </h4>
                      {!isPremium && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium Only
                        </Badge>
                      )}
                    </div>

                    {/* Logo Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <ImageIcon className="h-4 w-4" />
                          Logo
                        </Label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useLogo}
                              onChange={(e) => setUseLogo(e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">Include logo</span>
                          </label>
                        </div>
                        {isPremium && useLogo && (
                          <div className="mt-3">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {customLogo ? 'Change Logo' : 'Upload Custom Logo'}
                            </Button>
                            {customLogo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => setCustomLogo(null)}
                              >
                                Use Wyt Logo
                              </Button>
                            )}
                          </div>
                        )}
                        {!isPremium && useLogo && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Free plan uses Wyt logo. Upgrade to use your own logo.
                          </p>
                        )}
                      </div>

                      {/* Color Options - Premium */}
                      <div className={!isPremium ? 'opacity-50 pointer-events-none' : ''}>
                        <Label className="flex items-center gap-2 mb-2">
                          <Palette className="h-4 w-4" />
                          Colors
                          {!isPremium && <Lock className="h-3 w-3 text-gray-400" />}
                        </Label>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Foreground</span>
                            <input
                              type="color"
                              value={darkColor}
                              onChange={(e) => setDarkColor(e.target.value)}
                              className="w-12 h-8 rounded cursor-pointer block mt-1"
                              disabled={!isPremium}
                            />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Background</span>
                            <input
                              type="color"
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              className="w-12 h-8 rounded cursor-pointer block mt-1"
                              disabled={!isPremium}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Size - Premium */}
                    <div className={!isPremium ? 'opacity-50 pointer-events-none' : ''}>
                      <Label className="flex items-center gap-2 mb-2">
                        Export Size
                        {!isPremium && <Lock className="h-3 w-3 text-gray-400" />}
                      </Label>
                      <div className="flex gap-2">
                        {[256, 512, 768, 1024].map((s) => (
                          <Button
                            key={s}
                            variant={exportSize === s ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setExportSize(s)}
                            disabled={!isPremium && s > 512}
                          >
                            {s}px
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={generateQRCode} 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    data-testid="button-generate-qr"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate QR Code
                      </>
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
                    Preview
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
                          Save
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
                          <p className="text-xs text-muted-foreground truncate">
                            {item.content}
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
    </div>
  );
}
