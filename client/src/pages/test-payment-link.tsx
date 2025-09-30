import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, ExternalLink, Loader2, IndianRupee } from "lucide-react";

export default function TestPaymentLink() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: 1,
    description: "Test Payment - WytNet",
    customerName: "",
    customerEmail: "",
    customerContact: ""
  });

  const handleCreateLink = async () => {
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", "/api/payments/create-link", formData);
      
      if (result.success) {
        setPaymentLink(result.data);
        toast({
          title: "Success!",
          description: "Payment link created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create payment link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Payment link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Payment Link Generator</h1>
            <p className="text-muted-foreground">Create Razorpay payment links for testing</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Payment Link</CardTitle>
              <CardDescription>
                Generate a payment link to test Razorpay integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 1 })}
                    className="pl-9"
                    data-testid="input-amount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter payment description"
                  data-testid="input-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="John Doe"
                    data-testid="input-customer-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="john@example.com"
                    data-testid="input-customer-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerContact">Contact (Optional)</Label>
                <Input
                  id="customerContact"
                  value={formData.customerContact}
                  onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                  placeholder="+91 9876543210"
                  data-testid="input-customer-contact"
                />
              </div>

              <Button 
                onClick={handleCreateLink} 
                disabled={isLoading || !formData.amount}
                className="w-full"
                data-testid="button-create-link"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Payment Link'
                )}
              </Button>
            </CardContent>
          </Card>

          {paymentLink && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-green-600">Payment Link Created!</CardTitle>
                <CardDescription>Share this link with your customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Link (Short URL)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={paymentLink.short_url} 
                      readOnly 
                      className="font-mono text-sm"
                      data-testid="text-short-url"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(paymentLink.short_url)}
                      data-testid="button-copy-short-url"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open(paymentLink.short_url, '_blank')}
                      data-testid="button-open-short-url"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold">₹{(paymentLink.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{paymentLink.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs">{paymentLink.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reference ID</p>
                    <p className="font-mono text-xs">{paymentLink.reference_id}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> This payment link will expire if not used. You can track its status in your Razorpay dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}