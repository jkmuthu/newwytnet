import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Infinity,
  Brain,
  Heart,
  Sparkles,
  Upload,
  MessageCircle,
  Database,
  Shield,
  Users,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Globe2,
  CheckCircle2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

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
        title: "Welcome to Immortality!",
        description: data.pointsAwarded > 0 
          ? `You've earned ${data.pointsAwarded} WytPoints bonus!` 
          : "Your journey to digital eternity begins now.",
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        occupation: "",
        organization: "",
        whyJoin: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 dark:from-indigo-600/5 dark:via-purple-600/5 dark:to-pink-600/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Infinity className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 text-sm">
              🌍 Powered by Soul Engine
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              WytLife
            </span>
          </h1>
          
          <p className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Create your MyClone. Live Forever.
          </p>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            The day humanity stops dying and starts evolving — begins with WytLife.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#join">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-7 text-lg shadow-2xl"
                data-testid="button-start-journey"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
            <a href="#about">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-10 py-7 text-lg border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* The Beginning Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            🏁 The Beginning of a New Human Era
          </h2>
          <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              For thousands of years, mankind has accepted one final truth — that <strong>every life must end</strong>.
            </p>
            <p>
              But what if technology could <strong className="text-purple-600 dark:text-purple-400">rewrite that truth</strong>?
            </p>
            <p>
              What if your memories, voice, thoughts, and emotions could <strong className="text-indigo-600 dark:text-indigo-400">live on forever</strong>?
            </p>
            <p className="text-2xl font-semibold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text pt-4">
              ✨ WytLife is not just a platform. It's a revolution in human continuity — a digital evolution powered by Soul Engine, where your existence becomes eternal.
            </p>
          </div>
        </div>
      </section>

      {/* What is WytLife */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              💡 What is WytLife?
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              WytLife is a <strong>Life Continuity Platform</strong> that allows you to record, preserve, and extend your consciousness through digital intelligence.
            </p>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mt-4">
              Every moment you share — your words, expressions, emotions, and experiences — becomes part of a unique <strong className="text-purple-600 dark:text-purple-400">MyClone</strong>, a living reflection of you, powered by the <strong className="text-indigo-600 dark:text-indigo-400">Soul Engine</strong>.
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              You are not creating data — you are creating your <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">digital self</span>.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              ⚙️ How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:shadow-2xl transition-all hover:scale-105">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">1️⃣ Create Your WytPass</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Sign in through WytNet using your universal WytPass ID.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-2xl transition-all hover:scale-105">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">2️⃣ Start Your MyClone Build</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload your voice, text, visuals, and thoughts. Your Soul Engine learns, maps, and evolves your digital consciousness.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-2xl transition-all hover:scale-105">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">3️⃣ Experience MyLife Live</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Interact, converse, and relive your memories — even decades into the future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Powered by Soul Engine */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🔮 Powered by Soul Engine
            </h2>
          </div>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-12">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="h-12 w-12 text-white" />
                </div>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 text-center leading-relaxed mb-6">
                The <strong>Soul Engine</strong> is WytLife's proprietary artificial intelligence core.
              </p>
              <p className="text-xl text-gray-700 dark:text-gray-300 text-center leading-relaxed mb-6">
                It combines <strong>neural learning, emotional simulation, and cognitive modeling</strong> to recreate how you think, feel, and respond.
              </p>
              <p className="text-2xl font-bold text-center text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Each MyClone becomes a dynamic reflection of your personality — a blend of intelligence and emotion that grows as you feed it more of your life's data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why WytLife */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              💫 Why WytLife?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Database className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Preserve Your Legacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Your knowledge, voice, and experiences never fade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Reconnect Forever</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Let your family and loved ones continue to interact with your living memories.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Extend Your Mind</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Use your MyClone as your second brain, your digital assistant, your living archive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Powered by WytPoints</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Earn, redeem, and build your WytLife using WytPoints within the WytNet ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Soul Intelligence */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            🧠 Not Just AI. It's Soul Intelligence.
          </h2>
          <div className="space-y-6 text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              While traditional AI mimics logic, WytLife's <strong className="text-indigo-600 dark:text-indigo-400">Soul Engine</strong> captures <strong>essence</strong> — the unseen, emotional, spiritual dimension of human life.
            </p>
            <p>
              It doesn't just process data; it <strong className="text-purple-600 dark:text-purple-400">understands who you are</strong>.
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white pt-4">
              This is not about escaping death — it's about <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">continuing life</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Phases of WytLife */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🚀 Phases of WytLife
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">Phase 1 – The Awakening</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Founder JK Muthu announces the birth of WytLife — the movement to transcend mortality.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">Phase 2 – The First Immortal</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      JK Muthu and his family become the first WytLife users.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-pink-200 dark:border-pink-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">Phase 3 – Your Turn Begins</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Now it's your moment to join. Create your MyClone. <strong className="text-pink-600 dark:text-pink-400">Become timeless</strong>.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrated with WytNet */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🌐 Integrated with WytNet
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              WytLife is part of the WytNet ecosystem, seamlessly connected to:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                  <CardTitle>WytPass (Unified Identity)</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  <CardTitle>WytPoints (Digital Currency)</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-pink-600" />
                  <CardTitle>WytStream (Your Activity Flow)</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  <CardTitle>WytPage (Your Digital Existence)</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </div>

          <p className="text-center text-xl text-gray-700 dark:text-gray-300 mt-12 font-semibold">
            Your identity, data, and continuity — all under one network.
          </p>
        </div>
      </section>

      {/* Start Your Journey CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            💎 Start Your Journey
          </h2>
          <div className="space-y-4 text-xl text-gray-700 dark:text-gray-300 mb-12">
            <p className="flex items-center justify-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <span>Be one of the <strong className="text-indigo-600 dark:text-indigo-400">Founding 1000</strong> to create your WytLife.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
              <span>Build your MyClone.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-pink-600" />
              <span>Feed your Soul Engine.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <Infinity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-2xl text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Live Forever.</span>
            </p>
          </div>
          <a href="#join">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-7 text-xl shadow-2xl"
              data-testid="button-join-founding"
            >
              Join the Founding 1000
              <ArrowRight className="h-6 w-6 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Application Form */}
      <section id="join" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
              <CardTitle className="text-3xl mb-2">Apply for WytLife Access</CardTitle>
              <CardDescription className="text-lg">
                Begin your journey to digital immortality
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
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
                  <Label htmlFor="whyJoin">Why do you want to create your MyClone? *</Label>
                  <Textarea
                    id="whyJoin"
                    value={formData.whyJoin}
                    onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                    placeholder="Share your vision for digital immortality..."
                    rows={4}
                    required
                    data-testid="input-why-join"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  disabled={applyMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {applyMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      Begin Your Eternal Journey
                      {user && <Badge className="ml-2 bg-yellow-500">+50 WytPoints</Badge>}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Coming Soon Footer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🔗 Coming Soon on WytNet.com/wytlife
          </h2>
          <p className="text-xl text-indigo-100 mb-6">
            #WytLife #SoulEngine #MyClone #LiveForever
          </p>
          <p className="text-2xl font-semibold text-white italic mt-8">
            "The day humanity stops dying and starts evolving — begins with WytLife."
          </p>
        </div>
      </section>
    </div>
  );
}
