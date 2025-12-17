import { Switch, Route } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Home, 
  FileText, 
  Package, 
  Calendar, 
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  QrCode,
  Download,
  Copy,
  Trash2,
  Link as LinkIcon,
  Mail,
  Phone,
  Wifi,
  CreditCard,
  MapPin,
  Type,
  Loader2,
  Wallet,
  Gift,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import WytApiPage from "./pages/wytapi";
import AppPanelHome from "./pages/app-panel-home";

function WytDutyDashboard() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">WytDuty Dashboard</h1>
              <p className="text-white/90 text-sm">Manage your duties and tasks efficiently</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Duties</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Duties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Complete project documentation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: Today</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Review team reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: Tomorrow</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Submit monthly reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WytDutyMyDuties() {
  const [activeTab, setActiveTab] = useState("all");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Duties</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal duties and responsibilities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Duty
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No duties yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first duty</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Duty
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending duties</h3>
              <p className="text-gray-600 dark:text-gray-400">All caught up!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No completed duties</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete duties to see them here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No overdue duties</h3>
              <p className="text-gray-600 dark:text-gray-400">Great job staying on track!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WytDutyAssigned() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assigned Duties</h1>
        <p className="text-gray-600 dark:text-gray-400">Duties assigned by others</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No assigned duties</h3>
          <p className="text-gray-600 dark:text-gray-400">You have no duties assigned by others yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

function WytDutyCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Duty Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">View your duties in calendar format</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Calendar View</h3>
          <p className="text-gray-600 dark:text-gray-400">Calendar integration coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function WytDutySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WytDuty Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your duty management preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates for duties</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Due Date Reminders</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded before due dates</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== WytQRC App Components ====================

interface QRCodeData {
  id: string;
  type: string;
  content: string;
  name: string;
  createdAt: Date;
  dataUrl: string;
}

const qrTypeOptions = [
  { value: 'url', label: 'URL / Link', icon: LinkIcon, placeholder: 'https://example.com' },
  { value: 'text', label: 'Plain Text', icon: Type, placeholder: 'Enter your text here...' },
  { value: 'email', label: 'Email', icon: Mail, placeholder: 'email@example.com' },
  { value: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+1234567890' },
  { value: 'wifi', label: 'WiFi', icon: Wifi, placeholder: 'Network name' },
  { value: 'vcard', label: 'Contact Card', icon: CreditCard, placeholder: 'Contact details' },
  { value: 'location', label: 'Location', icon: MapPin, placeholder: 'Latitude, Longitude' },
];


interface PricingPlan {
  id: string;
  planName: string;
  planType: string;
  price: string;
  currency: string;
  usageUnit?: string;
  isDefault?: boolean;
}

interface AppPricing {
  success: boolean;
  appSlug: string;
  appName: string;
  isCoreApp: boolean;
  pricingModel: string;
  defaultPlan: PricingPlan | null;
  plans: PricingPlan[];
}

function WytQRCDashboard() {
  const [savedCodes, setSavedCodes] = useState<QRCodeData[]>([]);
  const [pricing, setPricing] = useState<AppPricing | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('wytqrc_codes');
    if (stored) {
      setSavedCodes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetch('/api/apps/wytqrc/pricing')
      .then(res => res.json())
      .then(data => {
        setPricing(data);
        setLoadingPricing(false);
      })
      .catch(() => setLoadingPricing(false));
  }, []);

  const getDefaultPlan = () => {
    if (pricing?.defaultPlan) {
      return pricing.defaultPlan;
    }
    if (pricing?.plans && pricing.plans.length > 0) {
      return pricing.plans.find(p => p.isDefault) || pricing.plans[0];
    }
    return null;
  };

  const defaultPlan = getDefaultPlan();
  const planPrice = defaultPlan ? parseFloat(defaultPlan.price || '0') : 0;
  const planType = defaultPlan?.planType || 'free';
  const planName = defaultPlan?.planName || 'Free';
  const usageUnit = defaultPlan?.usageUnit || 'download';

  const getPlanDescription = () => {
    if (planType === 'free') return 'Free to use';
    if (planType === 'pay_per_use') return `Create QR codes for free, pay only when you ${usageUnit}`;
    if (planType === 'monthly') return 'Monthly subscription plan';
    if (planType === 'yearly') return 'Yearly subscription plan';
    return 'Premium plan';
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">WytQRC Dashboard</h1>
                <p className="text-white/90 text-sm">Create and manage your QR codes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 dark:border-teal-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-xl">
                <CreditCard className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">
                  Your Plan: {loadingPricing ? 'Loading...' : planName}
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400">
                  {loadingPricing ? 'Fetching plan details...' : getPlanDescription()}
                </p>
              </div>
            </div>
            <div className="text-right">
              {loadingPricing ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-teal-200 dark:bg-teal-800 rounded mb-1"></div>
                  <div className="h-4 w-20 bg-teal-200 dark:bg-teal-800 rounded"></div>
                </div>
              ) : planType === 'free' ? (
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">FREE</p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">₹{planPrice}</p>
                  <p className="text-sm text-teal-600 dark:text-teal-400">
                    {planType === 'pay_per_use' ? `per ${usageUnit}` : 
                     planType === 'monthly' ? 'per month' : 
                     planType === 'yearly' ? 'per year' : ''}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <QrCode className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Created</p>
                <p className="text-2xl font-bold">{savedCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <LinkIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">URL Codes</p>
                <p className="text-2xl font-bold">{savedCodes.filter(c => c.type === 'url').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Free to Create</p>
                <p className="text-2xl font-bold text-green-600">✓</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/a/wytqrc/generate">
              <Button className="w-full h-20 text-lg" data-testid="btn-generate-qr">
                <Plus className="h-6 w-6 mr-2" />
                Generate New QR Code
              </Button>
            </a>
            <a href="/a/wytqrc/my-codes">
              <Button variant="outline" className="w-full h-20 text-lg" data-testid="btn-view-codes">
                <QrCode className="h-6 w-6 mr-2" />
                View My QR Codes
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>


      {savedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Saved Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savedCodes.slice(0, 4).map((code) => (
                <div key={code.id} className="p-4 border rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <img src={code.dataUrl} alt={code.name} className="w-24 h-24 mx-auto mb-2" />
                  <p className="text-sm font-medium truncate">{code.name}</p>
                  <p className="text-xs text-gray-500">{code.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WytQRCGenerate() {
  const { toast } = useToast();
  const [qrType, setQrType] = useState('url');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch dynamic pricing from database
  const { data: pricingData } = useQuery<{ 
    success: boolean; 
    defaultPlan: { price: string; planType: string } | null;
    plans: Array<{ planType: string; price: string; planName: string }>;
  }>({
    queryKey: ['/api/apps/wytqrc/pricing'],
  });

  // Get pay-per-use price from pricing data
  const payPerUsePlan = pricingData?.plans?.find(p => p.planType === 'pay_per_use') || pricingData?.defaultPlan;
  const qrcPrice = payPerUsePlan ? parseFloat(payPerUsePlan.price) : 10;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const generateQRCode = async () => {
    if (!content.trim()) {
      toast({ title: "Error", description: "Please enter content for your QR code", variant: "destructive" });
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create payment order first
      let orderResponse;
      try {
        orderResponse = await fetch('/api/qrcode/download-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      } catch (networkError: any) {
        console.error('Network error creating order:', networkError);
        throw new Error('Network error - please check your connection and try again');
      }

      if (!orderResponse.ok) {
        let errorData;
        try {
          errorData = await orderResponse.json();
        } catch {
          throw new Error(`Server error (${orderResponse.status})`);
        }
        const errorMsg = errorData.message || errorData.error || `Failed to create order (${orderResponse.status})`;
        console.error('Order creation failed:', errorData);
        throw new Error(errorMsg);
      }

      const orderData = await orderResponse.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: 'WytNet',
        description: `QR Code Generation - ₹${qrcPrice}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/qrcode/download-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Payment successful - now generate QR code
              let qrContent = content;
              
              if (qrType === 'email') {
                qrContent = `mailto:${content}`;
              } else if (qrType === 'phone') {
                qrContent = `tel:${content}`;
              } else if (qrType === 'wifi') {
                qrContent = `WIFI:T:${wifiEncryption};S:${content};P:${wifiPassword};;`;
              } else if (qrType === 'location') {
                const coords = content.split(',').map(s => s.trim());
                if (coords.length === 2) {
                  qrContent = `geo:${coords[0]},${coords[1]}`;
                }
              }

              const generateResponse = await fetch(`/api/qrcode/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: qrContent, type: qrType }),
              });

              const data = await generateResponse.json();

              if (!generateResponse.ok) throw new Error(data.error || 'Failed to generate QR code');
              
              setGeneratedQR(data.dataUrl);
              toast({ 
                title: "Payment Successful!", 
                description: "Your QR code has been generated. You can now download it." 
              });
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Please try again',
              variant: 'destructive',
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast({
              title: 'Payment Cancelled',
              description: 'QR code was not generated',
              variant: 'destructive',
            });
          },
        },
        theme: { color: '#0d9488' },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error:', error);
      toast({ title: "Error", description: error.message || "Failed to process. Please try again.", variant: "destructive" });
      setIsProcessingPayment(false);
    }
  };

  const saveQRCode = () => {
    if (!generatedQR) return;
    
    const qrName = name.trim() || `QR Code ${new Date().toLocaleString()}`;
    const newCode: QRCodeData = {
      id: Date.now().toString(),
      type: qrType,
      content,
      name: qrName,
      createdAt: new Date(),
      dataUrl: generatedQR,
    };

    const stored = localStorage.getItem('wytqrc_codes');
    const codes = stored ? JSON.parse(stored) : [];
    codes.unshift(newCode);
    localStorage.setItem('wytqrc_codes', JSON.stringify(codes));
    
    toast({ title: "Saved", description: "QR code saved to your collection!" });
  };

  const copyToClipboard = async () => {
    if (!generatedQR) return;
    
    try {
      const response = await fetch(generatedQR);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast({ title: "Copied", description: "QR code copied to clipboard!" });
    } catch {
      toast({ title: "Error", description: "Failed to copy. Try downloading instead.", variant: "destructive" });
    }
  };

  const selectedType = qrTypeOptions.find(t => t.value === qrType);
  const TypeIcon = selectedType?.icon || LinkIcon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generate QR Code</h1>
          <p className="text-gray-600 dark:text-gray-400">Create custom QR codes for any purpose</p>
        </div>
      </div>

      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 dark:border-teal-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-teal-800 dark:text-teal-200">Pay-Per-Use</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">Pay ₹{qrcPrice} to generate a QR code, then download freely</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">₹{qrcPrice}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400">per QR code</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Settings</CardTitle>
            <CardDescription>Configure your QR code content and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-name">QR Code Name (optional)</Label>
              <Input
                id="qr-name"
                placeholder="My QR Code"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-qr-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-type">QR Code Type</Label>
              <Select value={qrType} onValueChange={setQrType}>
                <SelectTrigger id="qr-type" data-testid="select-qr-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {qrTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-content" className="flex items-center gap-2">
                <TypeIcon className="h-4 w-4" />
                {selectedType?.label || 'Content'}
              </Label>
              {qrType === 'text' ? (
                <Textarea
                  id="qr-content"
                  placeholder={selectedType?.placeholder}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  data-testid="input-qr-content"
                />
              ) : (
                <Input
                  id="qr-content"
                  placeholder={selectedType?.placeholder}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  data-testid="input-qr-content"
                />
              )}
            </div>

            {qrType === 'wifi' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wifi-password">WiFi Password</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    placeholder="Enter WiFi password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    data-testid="input-wifi-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wifi-encryption">Encryption Type</Label>
                  <Select value={wifiEncryption} onValueChange={setWifiEncryption}>
                    <SelectTrigger id="wifi-encryption" data-testid="select-wifi-encryption">
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">No Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button 
              onClick={generateQRCode} 
              className="w-full" 
              disabled={isProcessingPayment}
              data-testid="btn-generate"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code (₹{qrcPrice})
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Your generated QR code will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQR ? (
              <div className="space-y-4">
                <div className="flex justify-center p-6 bg-white rounded-lg border">
                  <img src={generatedQR} alt="Generated QR Code" className="w-64 h-64" data-testid="img-qr-preview" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={saveQRCode} variant="default" className="flex-1" data-testid="btn-save-qr">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!generatedQR) return;
                      const link = document.createElement('a');
                      link.download = `${name || 'qrcode'}.png`;
                      link.href = generatedQR;
                      link.click();
                    }} 
                    variant="outline" 
                    className="flex-1" 
                    data-testid="btn-download-qr"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1" data-testid="btn-copy-qr">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <QrCode className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Enter content and click Generate to create your QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function WytQRCMyCodes() {
  const { toast } = useToast();
  const [savedCodes, setSavedCodes] = useState<QRCodeData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('wytqrc_codes');
    if (stored) {
      setSavedCodes(JSON.parse(stored));
    }
  }, []);

  const deleteCode = (id: string) => {
    const updated = savedCodes.filter(c => c.id !== id);
    setSavedCodes(updated);
    localStorage.setItem('wytqrc_codes', JSON.stringify(updated));
    toast({ title: "Deleted", description: "QR code removed from your collection." });
  };

  const downloadCode = (code: QRCodeData) => {
    const link = document.createElement('a');
    link.download = `${code.name}.png`;
    link.href = code.dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My QR Codes</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your saved QR codes</p>
        </div>
        <a href="/a/wytqrc/generate">
          <Button data-testid="btn-new-qr">
            <Plus className="h-4 w-4 mr-2" />
            New QR Code
          </Button>
        </a>
      </div>

      {savedCodes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No QR codes yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first QR code to get started</p>
            <a href="/a/wytqrc/generate">
              <Button data-testid="btn-create-first-qr">
                <Plus className="h-4 w-4 mr-2" />
                Create QR Code
              </Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCodes.map((code) => (
            <Card key={code.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-center p-4 bg-white rounded-lg mb-4">
                  <img src={code.dataUrl} alt={code.name} className="w-40 h-40" data-testid={`img-qr-${code.id}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium truncate">{code.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs capitalize">{code.type}</span>
                    <span>{new Date(code.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{code.content}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => downloadCode(code)}
                    data-testid={`btn-download-${code.id}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteCode(code.id)}
                    data-testid={`btn-delete-${code.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function WytQRCSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WytQRC Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your QR code preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default QR Size</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Set default size for generated QR codes</p>
              </div>
              <Select defaultValue="256">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128px</SelectItem>
                  <SelectItem value="256">256px</SelectItem>
                  <SelectItem value="512">512px</SelectItem>
                  <SelectItem value="1024">1024px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error Correction Level</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Higher levels allow more damage recovery</p>
              </div>
              <Select defaultValue="M">
                <SelectTrigger className="w-32">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export All QR Codes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download all your saved QR codes</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear All Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove all saved QR codes</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// App name mappings for display
const appNameMap: Record<string, string> = {
  'wytduty': 'WytDuty',
  'wytqrc': 'WytQRC',
  'wytpass': 'WytPass',
  'wytwall': 'WytWall',
  'wytassessor': 'WytAssessor',
  'wytbuilder': 'WytBuilder',
  'wytlife': 'WytLife',
};

function GenericAppDashboard({ appName }: { appName: string }) {
  // Convert slug to display name (e.g., 'expense-calculator' -> 'Expense Calculator')
  const slugToDisplayName = (slug: string): string => {
    // Check if we have a mapped name first
    if (appNameMap[slug.toLowerCase()]) {
      return appNameMap[slug.toLowerCase()];
    }
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const displayName = slugToDisplayName(appName);
  
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <p className="text-white/90 text-sm">App dashboard and features</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">App Panel Active</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You are now in {displayName} app panel. App-specific features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GenericAppSettings({ appName }: { appName: string }) {
  // Convert slug to display name
  const slugToDisplayName = (slug: string): string => {
    // Check if we have a mapped name first
    if (appNameMap[slug.toLowerCase()]) {
      return appNameMap[slug.toLowerCase()];
    }
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const displayName = slugToDisplayName(appName);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{displayName} Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your {displayName} preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage notification preferences</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Export or delete your data</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AppPanelRouter() {
  return (
    <Switch>
      {/* App Panel Home - Shows all added apps */}
      <Route path="/apppanel" component={AppPanelHome} />

      {/* WytApi App Routes - Both /a/ and /apppanel/ patterns */}
      <Route path="/a/wytapi" component={WytApiPage} />
      <Route path="/apppanel/wytapi" component={WytApiPage} />

      {/* WytDuty App Routes - Both /a/ and /apppanel/ patterns */}
      <Route path="/a/wytduty/settings" component={WytDutySettings} />
      <Route path="/a/wytduty/calendar" component={WytDutyCalendar} />
      <Route path="/a/wytduty/assigned" component={WytDutyAssigned} />
      <Route path="/a/wytduty/my-duties" component={WytDutyMyDuties} />
      <Route path="/a/wytduty/dashboard" component={WytDutyDashboard} />
      <Route path="/a/wytduty" component={WytDutyDashboard} />
      <Route path="/apppanel/wytduty/settings" component={WytDutySettings} />
      <Route path="/apppanel/wytduty/calendar" component={WytDutyCalendar} />
      <Route path="/apppanel/wytduty/assigned" component={WytDutyAssigned} />
      <Route path="/apppanel/wytduty/my-duties" component={WytDutyMyDuties} />
      <Route path="/apppanel/wytduty/dashboard" component={WytDutyDashboard} />
      <Route path="/apppanel/wytduty" component={WytDutyDashboard} />

      {/* WytQRC App Routes - Both /a/ and /apppanel/ patterns */}
      <Route path="/a/wytqrc/settings" component={WytQRCSettings} />
      <Route path="/a/wytqrc/my-codes" component={WytQRCMyCodes} />
      <Route path="/a/wytqrc/generate" component={WytQRCGenerate} />
      <Route path="/a/wytqrc/dashboard" component={WytQRCDashboard} />
      <Route path="/a/wytqrc" component={WytQRCDashboard} />
      <Route path="/apppanel/wytqrc/settings" component={WytQRCSettings} />
      <Route path="/apppanel/wytqrc/my-codes" component={WytQRCMyCodes} />
      <Route path="/apppanel/wytqrc/generate" component={WytQRCGenerate} />
      <Route path="/apppanel/wytqrc/dashboard" component={WytQRCDashboard} />
      <Route path="/apppanel/wytqrc" component={WytQRCDashboard} />

      {/* Generic app routes for /a/:appSlug pattern (new URL structure) */}
      <Route path="/a/:appSlug/settings">
        {(params) => <GenericAppSettings appName={params.appSlug || 'App'} />}
      </Route>
      <Route path="/a/:appSlug/dashboard">
        {(params) => <GenericAppDashboard appName={params.appSlug || 'App'} />}
      </Route>
      <Route path="/a/:appSlug">
        {(params) => <GenericAppDashboard appName={params.appSlug || 'App'} />}
      </Route>

      {/* Generic app routes for /apppanel/:appSlug pattern (legacy) */}
      <Route path="/apppanel/:appSlug/settings">
        {(params) => <GenericAppSettings appName={params.appSlug || 'App'} />}
      </Route>
      <Route path="/apppanel/:appSlug/dashboard">
        {(params) => <GenericAppDashboard appName={params.appSlug || 'App'} />}
      </Route>
      <Route path="/apppanel/:appSlug">
        {(params) => <GenericAppDashboard appName={params.appSlug || 'App'} />}
      </Route>

      {/* 404 for app panel */}
      <Route>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              App Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              The requested app does not exist
            </p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
