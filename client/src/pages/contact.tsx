import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageCircle, Globe, Clock, Send, Heart, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Contact() {
  const { toast } = useToast();
  
  // Set page-specific SEO meta tags
  useEffect(() => {
    document.title = "Contact Us - Get Support & Help | WytNet";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact WytNet for support, questions, or feedback. Get help with our productivity tools, technical support, or business partnerships.');
    }
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', 'Contact WytNet - Support & Help');
    if (ogDescription) ogDescription.setAttribute('content', 'Get support and help with WytNet productivity tools. Contact us for technical support, partnerships, or questions.');
    
    return () => {
      // Reset to default meta tags on cleanup
      document.title = "WytNet - Multi-Tenant SaaS Platform | Free Assessment Tools";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Build scalable SaaS applications with WytNet\'s multi-tenant platform. Start with free assessment tools, productivity suites, and specialized business utilities.');
      }
    };
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      title: "General Inquiries",
      description: "Questions about WytNet and our tools",
      icon: Mail,
      color: "text-blue-500",
      bgColor: "from-blue-500 to-purple-600",
      response: "24 hours"
    },
    {
      title: "Technical Support",
      description: "Help with using our WytApps",
      icon: Zap,
      color: "text-green-500", 
      bgColor: "from-green-500 to-emerald-600",
      response: "12 hours"
    },
    {
      title: "Partnerships",
      description: "Business partnerships and collaborations",
      icon: Users,
      color: "text-purple-500",
      bgColor: "from-purple-500 to-pink-600", 
      response: "48 hours"
    },
  ];

  const faqs = [
    {
      question: "How do I report a bug or issue?",
      answer: "Use the contact form below and select 'Technical Support' as the category. Include as much detail as possible about the issue you're experiencing."
    },
    {
      question: "Can I suggest a new WytApp?",
      answer: "Absolutely! We love hearing ideas from our users. Use the 'Feature Request' category in the contact form to share your suggestions."
    },
    {
      question: "Do you offer custom development?",
      answer: "We're exploring custom development services. Contact us under 'Partnerships' to discuss your specific needs and requirements."
    },
    {
      question: "How can I contribute to WytNet?",
      answer: "There are several ways to contribute - from beta testing new features to suggesting improvements. Reach out via 'General Inquiries' to learn more."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Get in Touch
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, 
            our team is here to help. We typically respond within 24 hours.
          </p>

          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center text-blue-600 font-medium">
              <Clock className="h-5 w-5 mr-2" />
              24h Response Time
            </div>
            <div className="flex items-center text-green-600 font-medium">
              <Globe className="h-5 w-5 mr-2" />
              Global Support
            </div>
            <div className="flex items-center text-purple-600 font-medium">
              <Heart className="h-5 w-5 mr-2" />
              Human Responses
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Can We Help?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the category that best fits your inquiry for the fastest response.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-r ${method.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{method.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{method.description}</p>
                  <div className="text-sm font-medium text-gray-500">
                    Typical response: {method.response}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">
                Send us a Message
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief subject line"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                  />
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-submit-contact"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {/* Form validation hints */}
                  {(!formData.name || !formData.email || !formData.message) && !isSubmitting && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Please fill in all required fields (*) to send your message
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    We'll respond within 24 hours during business days
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Answers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Common questions and answers that might help you right away.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}