import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle, Clock, Package, Globe } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ShippingPolicy() {
  const lastUpdated = "December 15, 2024";

  const shippingInfo = [
    {
      title: "Digital Services",
      description: "Instant delivery - access immediately after purchase",
      icon: Globe,
      color: "text-green-500",
      details: ["Software subscriptions", "Digital tools access", "Online services", "API access"]
    },
    {
      title: "Physical Products",
      description: "When applicable - branded merchandise or hardware",
      icon: Package,
      color: "text-blue-500",
      details: ["Branded merchandise", "Hardware devices", "Promotional items", "Custom products"]
    },
    {
      title: "Processing Time",
      description: "Digital: Instant | Physical: 1-2 business days",
      icon: Clock,
      color: "text-orange-500",
      details: ["Account activation: Immediate", "Physical items: 1-2 days processing", "Custom orders: 3-5 days", "Bulk orders: Contact us"]
    },
    {
      title: "Delivery Methods",
      description: "Multiple options based on location and urgency",
      icon: Truck,
      color: "text-purple-500",
      details: ["Standard shipping: 5-7 days", "Express shipping: 2-3 days", "International: 7-14 days", "Local pickup: Available"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Truck className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Shipping Policy
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Learn about our delivery methods and shipping terms for both digital services and physical products.
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
                    <p>• Digital services: Instant access after purchase</p>
                    <p>• Physical products: 1-2 days processing + shipping time</p>
                    <p>• Free shipping on orders over ₹2,000 (India) / $50 (International)</p>
                    <p>• Express shipping available for urgent deliveries</p>
                    <p>• Full tracking provided for all physical shipments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Shipping Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Shipping Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shippingInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4`}>
                      <info.icon className={`h-6 w-6 ${info.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {info.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    {info.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
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
                  <Globe className="h-6 w-6 text-blue-600 mr-3" />
                  Digital Services & Software
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Access</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    All digital services, software subscriptions, and online tools are delivered instantly upon successful payment:
                  </p>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Account access: Immediate</li>
                    <li>Software downloads: Available right away</li>
                    <li>API keys: Generated instantly</li>
                    <li>Premium features: Activated within minutes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email Confirmation</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    You'll receive email confirmation with access details, download links, and account information immediately after purchase.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="h-6 w-6 text-green-600 mr-3" />
                  Physical Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Processing Time</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Standard items: 1-2 business days</li>
                    <li>Custom products: 3-5 business days</li>
                    <li>Bulk orders: 5-7 business days</li>
                    <li>Pre-orders: As specified on product page</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Methods</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600 dark:text-gray-400">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2">Method</th>
                          <th className="text-left py-2">Time</th>
                          <th className="text-left py-2">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2">Standard Shipping</td>
                          <td className="py-2">5-7 business days</td>
                          <td className="py-2">₹50-150</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2">Express Shipping</td>
                          <td className="py-2">2-3 business days</td>
                          <td className="py-2">₹200-350</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2">International</td>
                          <td className="py-2">7-14 business days</td>
                          <td className="py-2">₹500-1500</td>
                        </tr>
                        <tr>
                          <td className="py-2">Local Pickup</td>
                          <td className="py-2">Same day</td>
                          <td className="py-2">Free</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Truck className="h-6 w-6 text-purple-600 mr-3" />
                  Delivery Areas & Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Domestic Shipping (India)</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>All major cities and towns</li>
                    <li>Rural areas (may take additional 1-2 days)</li>
                    <li>PO Box addresses accepted</li>
                    <li>Free shipping on orders over ₹2,000</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">International Shipping</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Available to most countries worldwide</li>
                    <li>Customs and duties may apply</li>
                    <li>Some restrictions on electronic items</li>
                    <li>Free shipping on orders over $50</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Restrictions</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We cannot ship to certain restricted areas or countries under trade sanctions. 
                    Contact us if you're unsure about shipping to your location.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  Order Tracking & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tracking Information</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Tracking number provided within 24 hours of shipment</li>
                    <li>Real-time updates via email and SMS</li>
                    <li>Online tracking portal available</li>
                    <li>Customer support for tracking issues</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Issues</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you experience any delivery issues, damaged packages, or missing items, 
                    contact us immediately at info@wytnet.com or +91 8220449911. 
                    We'll resolve the issue quickly and ensure you receive your order.
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
            Shipping Questions?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Our team is here to help with any shipping or delivery questions.
          </p>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Email: <strong>info@wytnet.com</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Phone: <strong>+91 8220449911</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Business Hours: Monday - Saturday, 9 AM - 6 PM IST
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}