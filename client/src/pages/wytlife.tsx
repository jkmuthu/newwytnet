import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Globe2,
  Target,
  MessageCircle,
  Brain,
  Trophy,
  GraduationCap,
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  Zap,
  CheckCircle2,
  Star,
  ArrowRight
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

const areasOfInterestOptions = [
  { id: "leadership", label: "Leadership" },
  { id: "productivity", label: "Productivity" },
  { id: "wellness", label: "Wellness" },
  { id: "networking", label: "Networking" }
];

export default function WytLife() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    city: "",
    country: "",
    occupation: "",
    organization: "",
    whyJoin: "",
    areasOfInterest: [] as string[]
  });

  const applyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/wytlife/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Application Submitted!",
        description: data.pointsAwarded > 0 
          ? `You've earned ${data.pointsAwarded} WytPoints bonus!` 
          : "We'll review your application soon.",
      });
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        occupation: "",
        organization: "",
        whyJoin: "",
        areasOfInterest: []
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.whyJoin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate(formData);
  };

  const toggleAreaOfInterest = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: prev.areasOfInterest.includes(area)
        ? prev.areasOfInterest.filter(a => a !== area)
        : [...prev.areasOfInterest, area]
    }));
  };

  const benefits = [
    {
      icon: Globe2,
      title: "Global Network",
      description: "Access to a global digital lifestyle network of professionals and innovators"
    },
    {
      icon: Target,
      title: "Personal & Professional Growth",
      description: "Growth challenges via WytGoals to achieve meaningful milestones"
    },
    {
      icon: MessageCircle,
      title: "Community & Mentorship",
      description: "Join community discussions and access mentorship circles"
    },
    {
      icon: Brain,
      title: "Life Balance Insights",
      description: "AI-powered tools & WytScore to optimize your lifestyle balance"
    },
    {
      icon: Trophy,
      title: "WytStar Recognition",
      description: "Earn badges and recognition for active contributions"
    },
    {
      icon: GraduationCap,
      title: "Exclusive Learning",
      description: "Access to webinars, programs, and certifications"
    },
    {
      icon: Briefcase,
      title: "Priority Access",
      description: "Early access to WytHubs and partner opportunities"
    },
    {
      icon: Users,
      title: "Community Feed",
      description: "Share insights, milestones, and life moments with members"
    }
  ];

  const features = [
    {
      icon: Target,
      title: "WytLife Dashboard",
      description: "Personal space to track activities & achievements",
      status: "Coming Soon"
    },
    {
      icon: TrendingUp,
      title: "Goal & Habit Tracker",
      description: "Integration with WytGoals & WytDuty",
      status: "Beta"
    },
    {
      icon: Users,
      title: "Events & Webinars",
      description: "Sessions on productivity, wellness, and innovation",
      status: "Launching Q2"
    },
    {
      icon: Star,
      title: "WytStar Recognition",
      description: "Badges for contributions and mentorship",
      status: "Active"
    },
    {
      icon: MessageCircle,
      title: "Community Feed",
      description: "Share insights and life moments",
      status: "Beta"
    },
    {
      icon: Brain,
      title: "AI-Powered LifeScore",
      description: "Calculates lifestyle balance using digital metrics",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              WytLife
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Better Lifestyle. Best Workstyle.
          </p>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join a global digital lifestyle movement. Empower yourself to live better, work smarter, and connect meaningfully.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#join">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                data-testid="button-join-now"
              >
                Join Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
            <a href="#about">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What is WytLife?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              WytLife is a <strong>digital lifestyle and workstyle community</strong> by WytNet, designed to empower 
              individuals and professionals to live better, work smarter, and connect meaningfully.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  To build a global digital lifestyle and workstyle community that empowers every individual to grow personally, professionally, and socially.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  To inspire members to adopt constructive digital habits, achieve meaningful goals, and create a balanced, productive lifestyle.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Philosophy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Combining the best of JCI (leadership), BNI (business networking), and LinkedIn (professional identity) into one unified digital experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              WytLife Benefits
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to thrive in the digital age
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Building the future of digital lifestyle management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant={feature.status === "Active" ? "default" : "secondary"}>
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="join" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Join WytLife Today</CardTitle>
              <CardDescription className="text-lg">
                Apply for early access to our global lifestyle community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      required
                      data-testid="input-full-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                      data-testid="input-city"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="United States"
                      data-testid="input-country"
                    />
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="Software Engineer"
                      data-testid="input-occupation"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company Name"
                    data-testid="input-organization"
                  />
                </div>

                <div>
                  <Label htmlFor="whyJoin">Why do you want to join WytLife? *</Label>
                  <Textarea
                    id="whyJoin"
                    value={formData.whyJoin}
                    onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                    placeholder="Tell us about your goals and what you hope to achieve..."
                    rows={4}
                    required
                    data-testid="input-why-join"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Areas of Interest</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {areasOfInterestOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={formData.areasOfInterest.includes(option.id)}
                          onCheckedChange={() => toggleAreaOfInterest(option.id)}
                          data-testid={`checkbox-${option.id}`}
                        />
                        <Label htmlFor={option.id} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={applyMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {applyMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Application
                      {user && <Badge className="ml-2 bg-yellow-500">+25 Points</Badge>}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Already a WytNet Member?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Access your WytPanel to manage your profile, track points, and explore all features.
          </p>
          <a href="/panel">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
              Access WytPanel
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
