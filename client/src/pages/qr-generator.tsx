import { useState, useRef, useEffect } from "react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import QRCode from "qrcode";
import { 
  Download, Share2, Copy, Smartphone, Globe, Mail, Wifi, QrCode, History, 
  Zap, Eye, CheckCircle, Star, Crown, Lock, Upload, Palette, Image as ImageIcon,
  CreditCard, IndianRupee
} from "lucide-react";
import wytLogoSquarePath from "@assets/Logo_003_1766709774257.jpg";
import PublicAppSidebar from "@/components/public/PublicAppSidebar";

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

const PER_USE_COST = 10;

export default function QRGenerator() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthContext();
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QRHistory[]>([]);

  const [qrType, setQrType] = useState('url');
  const [errorLevel, setErrorLevel] = useState('H');
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(4);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [exportSize, setExportSize] = useState(512);

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

  const { data: accessData, isLoading: accessLoading } = useQuery<AccessCheck>({
    queryKey: ['/api/qrcode/check-access'],
  });

  const isPremium = accessData?.subscriptionType === 'pay_per_use' || 
                    accessData?.subscriptionType === 'monthly' || 
                    accessData?.subscriptionType === 'yearly';
  
  const freeTypes = ['url', 'text'];
  const premiumTypes = ['whatsapp', 'wifi', 'email', 'sms', 'phone'];
  
  const requiresPremium = () => {
    if (premiumTypes.includes(qrType)) return true;
    if (customLogo) return true;
    if (darkColor !== '#000000' || lightColor !== '#ffffff') return true;
    if (exportSize > 512) return true;
    return false;
  };

  const addLogoToQR = (qrDataUrl: string, logoSrc: string, isFreePlan: boolean = true): Promise<string> => {
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
        
        ctx.drawImage(qrImage, 0, 0);
        
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = qrImage.width * 0.24;
          const logoX = (qrImage.width - logoSize) / 2;
          const logoY = (qrImage.height - logoSize) / 2;
          const radius = logoSize / 2;
          const centerX = logoX + radius;
          const centerY = logoY + radius;
          
          ctx.save();
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
          ctx.closePath();
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          
          if (isFreePlan) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          
          ctx.restore();
          
          resolve(canvas.toDataURL('image/png'));
        };
        logo.onerror = () => {
          resolve(qrDataUrl);
        };
        logo.src = logoSrc;
      };
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
  };

  const saveQRConfigToSession = () => {
    const config = {
      qrType, textContent, urlContent, emailTo, emailSubject, emailBody,
      phoneNumber, smsNumber, smsMessage, whatsappNumber, whatsappMessage,
      wifiSSID, wifiPassword, wifiSecurity, customLogo, darkColor, lightColor, exportSize
    };
    sessionStorage.setItem('pendingQRConfig', JSON.stringify(config));
  };

  const loadQRConfigFromSession = () => {
    const saved = sessionStorage.getItem('pendingQRConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setQrType(config.qrType || 'url');
        setTextContent(config.textContent || '');
        setUrlContent(config.urlContent || '');
        setEmailTo(config.emailTo || '');
        setEmailSubject(config.emailSubject || '');
        setEmailBody(config.emailBody || '');
        setPhoneNumber(config.phoneNumber || '');
        setSmsNumber(config.smsNumber || '');
        setSmsMessage(config.smsMessage || '');
        setWhatsappNumber(config.whatsappNumber || '');
        setWhatsappMessage(config.whatsappMessage || '');
        setWifiSSID(config.wifiSSID || '');
        setWifiPassword(config.wifiPassword || '');
        setWifiSecurity(config.wifiSecurity || 'WPA');
        setCustomLogo(config.customLogo || null);
        setDarkColor(config.darkColor || '#000000');
        setLightColor(config.lightColor || '#ffffff');
        setExportSize(config.exportSize || 512);
        sessionStorage.removeItem('pendingQRConfig');
        return true;
      } catch (e) {
        console.error('Failed to load QR config from session:', e);
      }
    }
    return false;
  };

  useEffect(() => {
    loadQRConfigFromSession();
  }, []);

  const getQRContent = () => {
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
    return content;
  };

  const generateQRCode = async (isPaid: boolean = false) => {
    setIsGenerating(true);
    
    try {
      const content = getQRContent();

      if (!content.trim()) {
        toast({
          title: "Content Required",
          description: "Please enter content to generate QR code.",
          variant: "destructive",
        });
        return;
      }

      const needsPremium = requiresPremium();
      const isFreePlan = !isPremium;

      if (needsPremium && !isPremium && !isPaid) {
        toast({
          title: "Premium Feature",
          description: "This configuration requires payment. Click 'Pay & Generate' to proceed.",
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
          dark: isPremium || isPaid ? darkColor : '#000000',
          light: isPremium || isPaid ? lightColor : '#ffffff',
        },
        width: isPremium || isPaid ? exportSize : 512,
      };

      let dataUrl = await QRCode.toDataURL(content, options);
      
      const logoToUse = (isPremium || isPaid) && customLogo ? customLogo : wytLogoSquarePath;
      const showFreeBranding = !isPremium && !isPaid;
      try {
        dataUrl = await addLogoToQR(dataUrl, logoToUse, showFreeBranding);
      } catch (logoError) {
        console.error('Logo overlay failed:', logoError);
      }
      
      setQrDataUrl(dataUrl);

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
        description: isPremium || isPaid ? "Premium QR code ready with your custom options." : "QR code ready with Wyt branding.",
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

  const handlePayAndGenerate = async () => {
    const content = getQRContent();
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    saveQRConfigToSession();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to use premium features. Your configuration will be saved.",
      });
      navigate('/login?redirect=/a/wytqrc&action=premium-qr');
      return;
    }

    try {
      const response = await apiRequest('/api/qrcode/create-payment', 'POST', {
        amount: PER_USE_COST * 100,
        qrType,
        description: `Premium QR Code - ${qrType.toUpperCase()}`,
      });

      const data = await response.json();

      if (data.orderId) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: PER_USE_COST * 100,
          currency: 'INR',
          name: 'WytNet',
          description: `Premium QR Code - ${qrType.toUpperCase()}`,
          order_id: data.orderId,
          handler: async function (rzpResponse: any) {
            try {
              const verifyRes = await apiRequest('/api/qrcode/verify-payment', 'POST', {
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                toast({
                  title: "Payment Successful!",
                  description: "Generating your premium QR code...",
                });
                await generateQRCode(true);
              }
            } catch (error) {
              toast({
                title: "Verification Failed",
                description: "Payment verification failed. Please contact support.",
                variant: "destructive",
              });
            }
          },
          prefill: {
            email: (user as any)?.email || '',
            contact: (user as any)?.phone || '',
          },
          theme: {
            color: '#6366f1',
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
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
          description: "Your custom logo will be used in the QR code (premium feature).",
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

  const qrTypes = [
    { value: 'url', icon: '🌐', label: 'Website', desc: 'Open links', premium: false },
    { value: 'text', icon: '📝', label: 'Text', desc: 'Plain text', premium: false },
    { value: 'whatsapp', icon: '💬', label: 'WhatsApp', desc: 'Send messages', premium: true },
    { value: 'phone', icon: '📞', label: 'Phone', desc: 'Call number', premium: true },
    { value: 'email', icon: '📧', label: 'Email', desc: 'Compose email', premium: true },
    { value: 'sms', icon: '💬', label: 'SMS', desc: 'Text message', premium: true },
    { value: 'wifi', icon: '📶', label: 'WiFi', desc: 'Connect network', premium: true },
  ];

  const needsPremiumFeature = requiresPremium();
  const showPayButton = needsPremiumFeature && !isPremium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
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
                        URL & Text QR types with Wyt logo • Pay ₹{PER_USE_COST}/use for premium features
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => navigate('/app/wytqrc')}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Per-Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Create QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="qr-type" className="text-sm font-medium mb-3 block">Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {qrTypes.map((type) => {
                        const isLocked = type.premium && !isPremium;
                        return (
                          <div
                            key={type.value}
                            onClick={() => setQrType(type.value)}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                              qrType === type.value
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                            }`}
                          >
                            {type.premium && (
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Customization
                      </h4>
                      {!isPremium && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          ₹{PER_USE_COST}/use
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <ImageIcon className="h-4 w-4" />
                          Custom Logo
                          {!isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                        </Label>
                        <div className="mt-2">
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
                            {customLogo ? 'Change Logo' : 'Upload Logo'}
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
                        {!isPremium && !customLogo && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Free plan uses Wyt logo watermark
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Palette className="h-4 w-4" />
                          Colors
                          {!isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                        </Label>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Foreground</span>
                            <input
                              type="color"
                              value={darkColor}
                              onChange={(e) => setDarkColor(e.target.value)}
                              className="w-12 h-8 rounded cursor-pointer block mt-1"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Background</span>
                            <input
                              type="color"
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              className="w-12 h-8 rounded cursor-pointer block mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        Export Size
                        {!isPremium && exportSize > 512 && <Crown className="h-3 w-3 text-yellow-500" />}
                      </Label>
                      <div className="flex gap-2">
                        {[256, 512, 768, 1024].map((s) => (
                          <Button
                            key={s}
                            variant={exportSize === s ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setExportSize(s)}
                          >
                            {s}px
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {showPayButton ? (
                    <Button 
                      onClick={handlePayAndGenerate}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      data-testid="button-pay-generate-qr"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay ₹{PER_USE_COST} & Generate QR Code
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => generateQRCode(false)} 
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
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
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

            <div className="lg:col-span-3">
              <PublicAppSidebar isAuthenticated={isAuthenticated} currentApp="wytqrc" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
