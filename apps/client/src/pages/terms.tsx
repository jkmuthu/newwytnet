import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, AlertTriangle, Shield, Users } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Terms() {
  const lastUpdated = "September 6, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Terms of Service
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Simple, fair terms for using WytNet and all WytApps. 
            We believe in transparency and keeping things straightforward.
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
                    <p>• Use all WytApps freely for personal and commercial purposes</p>
                    <p>• No accounts or registration required - just start using tools</p>
                    <p>• We provide tools "as is" - they're free, so no warranties</p>
                    <p>• Don't use our platform to harm others or break laws</p>
                    <p>• Contact us if you have questions or concerns</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Terms */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            
            <h2>1. Acceptance of Terms</h2>
            
            <p>By accessing and using WytNet and any of our WytApps, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h2>2. Description of Service</h2>
            
            <p>WytNet provides free, browser-based productivity tools including but not limited to:</p>
            
            <ul>
              <li>QR Code Generator</li>
              <li>DISC Assessment Tool</li>
              <li>AI Directory</li>
              <li>Invoice Generator</li>
              <li>Expense Calculator</li>
              <li>Business Card Designer</li>
              <li>Habit Tracker</li>
              <li>Unit Converter</li>
              <li>Quote Generator</li>
              <li>Multi Factor Astro Predictor</li>
            </ul>
            
            <p>All tools are provided free of charge and without the need for user registration.</p>

            <h2>3. Permitted Use</h2>
            
            <h3>You MAY:</h3>
            <ul>
              <li>Use all WytApps for personal purposes</li>
              <li>Use all WytApps for commercial purposes</li>
              <li>Generate content (QR codes, invoices, assessments) for business use</li>
              <li>Share links to WytNet and individual tools</li>
              <li>Suggest improvements or new features</li>
            </ul>

            <h3>You MAY NOT:</h3>
            <ul>
              <li>Attempt to reverse engineer or copy our tools</li>
              <li>Use automated systems to abuse our services</li>
              <li>Create competing services using our tools</li>
              <li>Engage in any illegal activities using our platform</li>
              <li>Spread malware, viruses, or harmful code through our platform</li>
              <li>Harass other users or our team</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            
            <ul>
              <li><strong>WytNet Platform:</strong> All code, design, and functionality of WytNet remains our intellectual property</li>
              <li><strong>Your Content:</strong> Content you create using our tools (QR codes, invoices, etc.) belongs to you</li>
              <li><strong>Third-Party Content:</strong> AI Directory listings and external links are owned by their respective owners</li>
              <li><strong>Trademarks:</strong> WytNet, WytApps, and related marks are our trademarks</li>
            </ul>

            <h2>5. Privacy and Data</h2>
            
            <p>Our privacy practices are detailed in our <a href="/privacy">Privacy Policy</a>. Key points:</p>
            
            <ul>
              <li>We don't collect personal information</li>
              <li>All processing happens in your browser</li>
              <li>No accounts or registration required</li>
              <li>Your data stays on your device</li>
            </ul>

            <h2>6. Disclaimers</h2>
            
            <Card className="my-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Important Disclaimers
                    </h3>
                    <div className="text-yellow-700 dark:text-yellow-300 text-sm space-y-2">
                      <p>• WytApps are provided "as is" without warranties of any kind</p>
                      <p>• Results from tools (assessments, calculations) are for informational purposes only</p>
                      <p>• We don't guarantee accuracy, reliability, or availability</p>
                      <p>• Use professional services for critical business or legal matters</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ul>
              <li><strong>No Warranties:</strong> We provide tools "as is" without express or implied warranties</li>
              <li><strong>Educational Purpose:</strong> Assessment tools are for informational purposes, not professional advice</li>
              <li><strong>Accuracy:</strong> While we strive for accuracy, we don't guarantee error-free results</li>
              <li><strong>Availability:</strong> We don't guarantee uninterrupted access to our services</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            
            <p>To the maximum extent permitted by law:</p>
            
            <ul>
              <li>WytNet and its operators shall not be liable for any direct, indirect, incidental, or consequential damages</li>
              <li>This includes damages from use, inability to use, or reliance on our tools</li>
              <li>You use our services at your own risk</li>
              <li>Our liability is limited to the amount you paid us (which is $0 for free tools)</li>
            </ul>

            <h2>8. External Links and Services</h2>
            
            <ul>
              <li><strong>AI Directory:</strong> Contains links to external AI tools and services</li>
              <li><strong>No Endorsement:</strong> Inclusion doesn't constitute endorsement</li>
              <li><strong>Third-Party Terms:</strong> External services have their own terms and privacy policies</li>
              <li><strong>UTM Tracking:</strong> We add tracking parameters to external links for attribution</li>
            </ul>

            <h2>9. Changes to Service</h2>
            
            <ul>
              <li>We may modify, suspend, or discontinue any part of our service</li>
              <li>We may add new features or tools at any time</li>
              <li>Major changes will be communicated through our website</li>
              <li>Continued use after changes constitutes acceptance</li>
            </ul>

            <h2>10. Termination</h2>
            
            <ul>
              <li>You may stop using our services at any time</li>
              <li>We may restrict access for violations of these terms</li>
              <li>Since no accounts are required, "termination" means ceasing to provide service</li>
              <li>These terms survive termination where applicable</li>
            </ul>

            <h2>11. Governing Law</h2>
            
            <ul>
              <li>These terms are governed by applicable international laws</li>
              <li>Disputes will be resolved through good faith discussion</li>
              <li>If formal resolution is needed, it will be subject to appropriate jurisdiction</li>
            </ul>

            <h2>12. Contact Information</h2>
            
            <p>For questions about these terms or our services:</p>
            
            <ul>
              <li>Use our <a href="/contact">contact form</a></li>
              <li>Select "General Inquiry" for terms-related questions</li>
              <li>We typically respond within 24 hours</li>
            </ul>

            <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Fair and Simple Terms
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-base">
                      We believe in keeping our terms simple and fair. If anything is unclear or you have concerns, 
                      please don't hesitate to reach out. We're here to help, not hide behind legal language.
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