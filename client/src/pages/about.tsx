import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Zap, Globe, Heart, Shield, Rocket, Award, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Tools Available", value: "10+", icon: Zap },
    { label: "Countries Served", value: "25+", icon: Globe },
    { label: "Uptime", value: "99.9%", icon: Shield },
  ];

  const values = [
    {
      title: "Better Lifestyle",
      description: "We believe technology should enhance your personal life, not complicate it. Our tools help you track habits, manage time, and achieve your lifestyle goals.",
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Best Workstyle",
      description: "Professional success comes from working smarter, not harder. We provide tools that streamline your workflow and boost productivity.",
      icon: Rocket,
      color: "text-blue-500"
    },
    {
      title: "Accessibility First",
      description: "Every tool should be accessible to everyone. No complex signups, no premium barriers - just instant access to powerful functionality.",
      icon: Target,
      color: "text-green-500"
    },
    {
      title: "Quality & Trust",
      description: "We're committed to delivering reliable, secure, and high-quality tools that professionals can depend on for their daily work.",
      icon: Award,
      color: "text-purple-500"
    },
  ];

  const team = [
    {
      name: "WytNet Development Team",
      role: "Platform Architects & Engineers",
      description: "A dedicated team focused on building the next generation of productivity tools for modern professionals."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            About WytNet
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            We're building the future of work and lifestyle productivity. WytNet is a comprehensive platform that provides 
            free, powerful tools designed to help professionals and individuals achieve <strong>Better Lifestyle and Best Workstyle</strong>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/wytapps">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                Explore WytApps
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 px-8">
                Get in Touch
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
              To democratize access to powerful productivity tools and make professional-grade software available to everyone, 
              regardless of budget or technical expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why WytNet Exists
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">Free Forever:</strong>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      Professional tools shouldn't be locked behind paywalls. We believe in providing value without cost barriers.
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">Instant Access:</strong>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      No lengthy signup processes or email verifications. Start using our tools immediately.
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">Quality First:</strong>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      Every tool is crafted with attention to detail, ensuring professional results every time.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Zap className="h-20 w-20 mx-auto mb-4" />
                  <div className="text-2xl font-bold">10,000+ Users</div>
                  <div className="text-blue-100">Trust WytNet Daily</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              These principles guide everything we build and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                      <value.icon className={`h-6 w-6 ${value.color}`} />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Built by Passionate Developers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Our team is dedicated to creating tools that make a real difference in how people work and live.
            </p>
          </div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <Card key={index} className="max-w-md text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{member.name}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the WytNet Community
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Be part of the growing community of professionals who choose WytNet for their productivity needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/wytapps">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                Start Using WytApps
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                Contact Our Team
                <Heart className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}