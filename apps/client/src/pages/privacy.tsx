import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Globe, CheckCircle, AlertTriangle } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Privacy() {
  const lastUpdated = "September 6, 2025";

  const principles = [
    {
      title: "No Data Collection",
      description: "We don't collect, store, or track your personal information. Your data stays on your device.",
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "No Registration Required",
      description: "Use all WytApps without creating accounts or providing personal information.",
      icon: Lock,
      color: "text-blue-500"  
    },
    {
      title: "No Third-Party Tracking",
      description: "We don't use analytics services that track users or advertising networks.",
      icon: Eye,
      color: "text-purple-500"
    },
    {
      title: "Local Processing",
      description: "All tools process data locally in your browser - nothing is sent to our servers.",
      icon: Globe,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Privacy Policy
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Your privacy is our priority. WytNet is built with privacy-first principles - 
            we don't collect your data because we don't need it.
          </p>

          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Privacy Principles
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              WytNet is designed from the ground up to protect your privacy and data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <principle.icon className={`h-8 w-8 ${principle.color}`} />
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            
            <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      Simple Summary
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-base">
                      WytNet doesn't collect, store, or share any personal information. All WytApps work entirely in your browser. 
                      We don't require accounts, track usage, or use advertising networks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2>1. Information We Don't Collect</h2>
            
            <p>Unlike most web services, WytNet is designed to not collect personal information:</p>
            
            <ul>
              <li><strong>No Personal Data:</strong> We don't collect names, email addresses, phone numbers, or other personal identifiers</li>
              <li><strong>No Usage Tracking:</strong> We don't track which tools you use, how often you use them, or what you create</li>
              <li><strong>No Account Data:</strong> Since no accounts are required, we don't store usernames, passwords, or profiles</li>
              <li><strong>No Location Data:</strong> We don't collect or store your IP address, location, or geographic information</li>
              <li><strong>No Device Information:</strong> We don't collect device types, browser information, or technical specifications</li>
            </ul>

            <h2>2. How Our Tools Work</h2>
            
            <p>All WytApps are designed for maximum privacy:</p>
            
            <ul>
              <li><strong>Local Processing:</strong> QR codes, calculations, and all processing happens in your browser</li>
              <li><strong>No Server Storage:</strong> Your data never leaves your device - we don't receive or store it</li>
              <li><strong>Instant Results:</strong> Tools provide immediate output without sending data to our servers</li>
              <li><strong>No Cloud Sync:</strong> Nothing is synchronized or backed up to our servers</li>
            </ul>

            <h2>3. Technical Information</h2>
            
            <p>For basic website functionality, standard web technologies may collect minimal technical information:</p>
            
            <ul>
              <li><strong>Server Logs:</strong> Basic access logs may be generated for security and uptime monitoring</li>
              <li><strong>Cookies:</strong> We use minimal functional cookies for website operation, not tracking</li>
              <li><strong>Local Storage:</strong> Some tools may save preferences in your browser's local storage (stays on your device)</li>
            </ul>

            <h2>4. Third-Party Services</h2>
            
            <p>WytNet minimizes third-party services to protect your privacy:</p>
            
            <ul>
              <li><strong>No Analytics:</strong> We don't use Google Analytics or similar tracking services</li>
              <li><strong>No Advertising:</strong> No advertising networks or tracking pixels</li>
              <li><strong>No Social Media Integration:</strong> No social media tracking or sharing integrations</li>
              <li><strong>External Links:</strong> Links to external services (like AI Directory entries) include UTM parameters for attribution but don't share your personal data</li>
            </ul>

            <h2>5. Data Security</h2>
            
            <p>Even though we don't collect data, security is still important:</p>
            
            <ul>
              <li><strong>HTTPS Encryption:</strong> All connections are encrypted in transit</li>
              <li><strong>Secure Infrastructure:</strong> Our hosting platform follows security best practices</li>
              <li><strong>No Data Breaches:</strong> Since we don't store personal data, there's nothing to breach</li>
              <li><strong>Regular Updates:</strong> We keep our platform updated with security patches</li>
            </ul>

            <h2>6. Children's Privacy</h2>
            
            <p>WytNet is safe for users of all ages:</p>
            
            <ul>
              <li>We don't knowingly collect information from children under 13</li>
              <li>Since we don't collect personal information from anyone, this protection extends to all users</li>
              <li>Parents can feel confident letting children use our educational tools</li>
            </ul>

            <h2>7. International Users</h2>
            
            <p>Our privacy-first approach works globally:</p>
            
            <ul>
              <li><strong>GDPR Compliant:</strong> No personal data collection means automatic GDPR compliance</li>
              <li><strong>Global Access:</strong> Available worldwide without region-specific data handling</li>
              <li><strong>No Cross-Border Data Transfer:</strong> Your data stays in your browser</li>
            </ul>

            <h2>8. Changes to This Policy</h2>
            
            <p>We may update this privacy policy to:</p>
            
            <ul>
              <li>Clarify our privacy practices</li>
              <li>Add new privacy protections</li>
              <li>Reflect changes in web technologies</li>
            </ul>
            
            <p>Any changes will be posted on this page with an updated "last modified" date. Continued use of WytNet after changes constitutes acceptance of the updated policy.</p>

            <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Questions About Privacy?
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-base">
                      If you have questions about our privacy practices or this policy, please contact us through our 
                      <a href="/contact" className="underline ml-1">contact page</a>. We're happy to explain how we protect your privacy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}