import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, HelpCircle, Search, Book, MessageCircle, Zap, CheckCircle, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "Do I need to create an account to use WytApps?",
          a: "No! All WytApps work without any registration or sign-up. Just visit any tool and start using it immediately."
        },
        {
          q: "Are WytApps really free?",
          a: "Yes, all current WytApps are completely free with no hidden costs, premium tiers, or subscription fees."
        },
        {
          q: "How do I access WytApps?",
          a: "Simply go to any WytApp from the homepage or WytApps page. Click the tool you want to use and it will open instantly."
        }
      ]
    },
    {
      category: "Using WytApps",
      questions: [
        {
          q: "Why is my QR code not scanning properly?",
          a: "Ensure the QR code is generated at sufficient size and quality. Try increasing the size or changing the error correction level."
        },
        {
          q: "Can I save my DISC assessment results?",
          a: "Yes, you can download or print your assessment results as a PDF. The results are generated locally and not stored on our servers."
        },
        {
          q: "How accurate is the AI Directory information?",
          a: "We regularly update the AI Directory with current information, but details may change. Always verify information on the official websites."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "A WytApp isn't loading or working properly",
          a: "Try refreshing the page first. If the issue persists, try clearing your browser cache or using a different browser."
        },
        {
          q: "Can I use WytApps on my mobile device?",
          a: "Yes! All WytApps are optimized for mobile devices and work on smartphones and tablets."
        },
        {
          q: "Do WytApps work offline?",
          a: "Most WytApps require an internet connection to load initially, but many functions work offline once loaded."
        }
      ]
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          q: "Is my data safe when using WytApps?",
          a: "Yes! Your data is processed locally in your browser and never sent to our servers. We don't store or track your usage."
        },
        {
          q: "Do you collect any personal information?",
          a: "No, we don't collect personal information, track usage, or require accounts. See our Privacy Policy for details."
        },
        {
          q: "Can I use WytApps for business purposes?",
          a: "Absolutely! All WytApps are free for both personal and commercial use."
        }
      ]
    }
  ];

  const quickLinks = [
    {
      title: "QR Code Generator",
      description: "Create QR codes for URLs, text, and contact info",
      icon: Zap,
      link: "/qr-generator"
    },
    {
      title: "DISC Assessment",
      description: "Take our personality assessment tool",
      icon: Star,
      link: "/assessment"
    },
    {
      title: "AI Directory",
      description: "Browse our collection of AI tools",
      icon: Book,
      link: "/ai-directory"
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: MessageCircle,
      link: "/contact"
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Help Center
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Find answers to common questions about WytNet and WytApps. 
            Get help with using our tools and troubleshooting any issues.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Access
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Jump directly to popular tools or get help from our support team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, index) => (
              <Link key={index} href={item.link}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md cursor-pointer">
                  <CardHeader className="text-center pb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Find answers to the most common questions about using WytNet and our tools.
            </p>
          </div>

          {searchQuery && filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Try different keywords or browse all categories below.
              </p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {(searchQuery ? filteredFaqs : faqs).map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.category}
                    </h3>
                    <Badge className="ml-3" variant="outline">
                      {category.questions.length} questions
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <Card key={faqIndex} className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {faq.q}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                Contact Support
                <MessageCircle className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/wytapps">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                Browse WytApps
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}