import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, Clock, CreditCard, AlertCircle } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function RefundPolicy() {
  const lastUpdated = "December 15, 2024";

  const refundProcess = [
    {
      step: "1",
      title: "Request Refund",
      description: "Contact us within 30 days of purchase with your order details",
      icon: AlertCircle,
      color: "text-blue-500"
    },
    {
      step: "2", 
      title: "Review Process",
      description: "We review your request within 2-3 business days",
      icon: Clock,
      color: "text-orange-500"
    },
    {
      step: "3",
      title: "Approval & Processing",
      description: "Once approved, refunds are processed within 5-7 business days",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      step: "4",
      title: "Refund Complete",
      description: "Amount credited back to your original payment method",
      icon: CreditCard,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <RefreshCw className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Refund Policy
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            We want you to be completely satisfied with WytNet services. 
            Our refund policy is designed to be fair and transparent.
          </p>

          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-8">
              <div className="flex items-start">
                <CheckCircle className="h-8 w-8 text-green-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200 mb-4">
                    Quick Summary
                  </h3>
                  <div className="text-green-700 dark:text-green-300 space-y-2">
                    <p>• 30-day money-back guarantee on all paid services</p>
                    <p>• No questions asked for cancellations within 7 days</p>
                    <p>• Free tools and services are non-refundable (they're free!)</p>
                    <p>• Refunds processed within 5-7 business days after approval</p>
                    <p>• Contact info@wytnet.com for refund requests</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Refund Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How Refunds Work
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {refundProcess.map((step) => (
              <Card key={step.step} className="relative">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                      <step.icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  Eligible for Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Paid Services & Subscriptions</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Monthly or annual subscription plans</li>
                    <li>Premium features and add-ons</li>
                    <li>Custom development services</li>
                    <li>Enterprise solutions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Timeframe</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Refund requests must be made within 30 days of the original purchase date. 
                    For subscriptions, this applies to the current billing period.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                  Non-Refundable Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 ml-4 list-disc">
                  <li>Free tools and services (QR Generator, AI Directory, etc.)</li>
                  <li>Completed custom development work</li>
                  <li>Services used for more than 30 days</li>
                  <li>Domain registrations and third-party services</li>
                  <li>Promotional or discounted services (unless required by law)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                  Refund Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to Request</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Send an email to <strong>info@wytnet.com</strong> with the following information:
                  </p>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Your order number or transaction ID</li>
                    <li>Email address used for purchase</li>
                    <li>Reason for refund request</li>
                    <li>Date of original purchase</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Processing Time</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Once approved, refunds are processed within 5-7 business days. 
                    The refund will appear in your original payment method.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                  Special Circumstances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Issues</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you experience technical problems that prevent you from using our services, 
                    we'll work with you to resolve the issue or provide a refund.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Billing Errors</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you notice any billing errors or unauthorized charges, 
                    contact us immediately for investigation and resolution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Questions About Refunds?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Our team is here to help with any refund questions or concerns.
          </p>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Email: <strong>info@wytnet.com</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Phone: <strong>+91 8220449911</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Response time: Within 24 hours
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}