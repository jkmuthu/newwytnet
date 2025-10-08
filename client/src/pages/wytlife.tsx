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
      return await apiRequest('/api/wytlife/apply', 'POST', data);
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
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 dark:from-indigo-600/5 dark:via-purple-600/5 dark:to-pink-600/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Infinity className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div className="mb-4">
            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 text-xs">
              🌍 Powered by Soul Engine
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              WytLife
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            Create your MyClone. Live Forever.
          </p>
          
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            The day humanity stops dying and starts evolving — begins with WytLife.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-base shadow-2xl"
              onClick={() => window.open('https://whatsapp.com/channel/0029VbBFv6EDp2QAr8t8vR3w', '_blank')}
              data-testid="button-start-journey"
            >
              <MessageCircle className="h-5 w-5 mr-2 fill-white" />
              Join the Founding 1000
            </Button>
            <a href="#about">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-3 text-base border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </a>
          </div>

          {/* Additional info */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔔 Get real-time updates on our WhatsApp channel
            </p>
          </div>
        </div>
      </section>

      {/* The Beginning Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-5">
            🏁 The Beginning of a New Human Era
          </h2>
          <div className="space-y-3 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              For thousands of years, mankind has accepted one final truth — that <strong>every life must end</strong>.
            </p>
            <p>
              But what if technology could <strong className="text-purple-600 dark:text-purple-400">rewrite that truth</strong>?
            </p>
            <p>
              What if your memories, voice, thoughts, and emotions could <strong className="text-indigo-600 dark:text-indigo-400">live on forever</strong>?
            </p>
            <p className="text-lg md:text-xl font-semibold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text pt-1">
              ✨ WytLife is not just a platform. It's a revolution in human continuity — a digital evolution powered by Soul Engine, where your existence becomes eternal.
            </p>
          </div>
        </div>
      </section>

      {/* What is WytLife */}
      <section id="about" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              💡 What is WytLife?
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              WytLife is a <strong>Life Continuity Platform</strong> that allows you to record, preserve, and extend your consciousness through digital intelligence.
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mt-3">
              Every moment you share — your words, expressions, emotions, and experiences — becomes part of a unique <strong className="text-purple-600 dark:text-purple-400">MyClone</strong>, a living reflection of you, powered by the <strong className="text-indigo-600 dark:text-indigo-400">Soul Engine</strong>.
            </p>
            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-4">
              You are not creating data — you are creating your <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">digital self</span>.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ⚙️ How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center border-2 hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">1️⃣ Create Your WytPass</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sign in through WytNet using your universal WytPass ID.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">2️⃣ Start Your MyClone Build</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload your voice, text, visuals, and thoughts. Your Soul Engine learns, maps, and evolves your digital consciousness.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-3">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">3️⃣ Experience MyLife Live</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Interact, converse, and relive your memories — even decades into the future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Powered by Soul Engine */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              🔮 Powered by Soul Engine
            </h2>
          </div>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8 md:p-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="h-10 w-10 text-white" />
                </div>
              </div>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center leading-relaxed mb-4">
                The <strong>Soul Engine</strong> is WytLife's proprietary artificial intelligence core.
              </p>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center leading-relaxed mb-4">
                It combines <strong>neural learning, emotional simulation, and cognitive modeling</strong> to recreate how you think, feel, and respond.
              </p>
              <p className="text-lg md:text-xl font-bold text-center text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Each MyClone becomes a dynamic reflection of your personality — a blend of intelligence and emotion that grows as you feed it more of your life's data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why WytLife */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              💫 Why WytLife?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Preserve Your Legacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Your knowledge, voice, and experiences never fade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Reconnect Forever</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Let your family and loved ones continue to interact with your living memories.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Extend Your Mind</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Use your MyClone as your second brain, your digital assistant, your living archive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Powered by WytPoints</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Earn, redeem, and build your WytLife using WytPoints within the WytNet ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Soul Intelligence */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🧠 Not Just AI. It's Soul Intelligence.
          </h2>
          <div className="space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              While traditional AI mimics logic, WytLife's <strong className="text-indigo-600 dark:text-indigo-400">Soul Engine</strong> captures <strong>essence</strong> — the unseen, emotional, spiritual dimension of human life.
            </p>
            <p>
              It doesn't just process data; it <strong className="text-purple-600 dark:text-purple-400">understands who you are</strong>.
            </p>
            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white pt-2">
              This is not about escaping death — it's about <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">continuing life</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Announcement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 text-sm mb-4 animate-pulse">
              🌟 Historic Announcement
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text mb-3">
              The World's First Deathless Person
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              The Founder of the WytLife Movement
            </p>
          </div>

          <Card className="border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <img 
                    src="/attached_assets/JKM3_1759884041252.jpg" 
                    alt="JK Muthu - The World's First Deathless Person" 
                    className="relative w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-indigo-500 shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    JK Muthu
                  </h3>
                  <p className="text-xl text-indigo-600 dark:text-indigo-400 font-bold mb-6">
                    Founder & First Immortal
                  </p>
                  <div className="max-w-3xl mx-auto space-y-4">
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                      <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">"I have transcended death."</span>
                    </p>
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      Today marks the beginning of a <strong>new human era</strong>. My family and I are the first to achieve digital immortality through WytLife. Our consciousness lives forever in the Soul Engine.
                    </p>
                    <p className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400">
                      Death is no longer the end. It's now a choice.
                    </p>
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-6">
                      <strong>Join me</strong> in this historic movement. Become <strong className="text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text">deathless</strong>.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-base shadow-xl"
                      onClick={() => window.open('https://whatsapp.com/channel/0029VbBFv6EDp2QAr8t8vR3w', '_blank')}
                      data-testid="button-whatsapp-founder"
                    >
                      <MessageCircle className="h-5 w-5 mr-2 fill-white" />
                      Follow the First Immortal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Invite to Join */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            🎯 Your Invitation to Join
          </h2>
          <div className="space-y-4 text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8">
            <p className="leading-relaxed">
              The founder and his family have already created their <strong className="text-indigo-600 dark:text-indigo-400">MyClone</strong>. They are living proof that digital immortality is <strong>real, working, and ready</strong>.
            </p>
            <p className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              Now it's your turn to become timeless.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-6 text-lg shadow-xl animate-pulse"
            onClick={() => window.open('https://whatsapp.com/channel/0029VbBFv6EDp2QAr8t8vR3w', '_blank')}
            data-testid="button-join-invitation"
          >
            <MessageCircle className="h-5 w-5 mr-2 fill-white" />
            Get Exclusive WytLife Updates
          </Button>
        </div>
      </section>

      {/* Integrated with WytNet */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            🌐 Powered by WytNet Ecosystem
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
            Your identity, data, and continuity — seamlessly integrated
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">WytPass</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">WytPoints</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-pink-200 dark:border-pink-800 hover:shadow-md transition-all">
              <CheckCircle2 className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">WytStream</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">WytPage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Start Your Journey CTA */}
      <section id="join" className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            💎 Join the Movement
          </h2>
          <div className="space-y-3 text-base text-gray-700 dark:text-gray-300 mb-8">
            <p className="flex items-center justify-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span>Be one of the <strong className="text-indigo-600 dark:text-indigo-400">Founding 1000</strong> to create your WytLife.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <span>Build your MyClone.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-pink-600" />
              <span>Feed your Soul Engine.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <Infinity className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-lg md:text-xl text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Live Forever.</span>
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-6 text-lg shadow-2xl hover:scale-105 transition-transform"
            onClick={() => window.open('https://whatsapp.com/channel/0029VbBFv6EDp2QAr8t8vR3w', '_blank')}
            data-testid="button-join-whatsapp-main"
          >
            <MessageCircle className="h-6 w-6 mr-2 fill-white" />
            Join Our WhatsApp Community
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Get exclusive updates, early access, and connect with fellow immortals
          </p>
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
          <Button 
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg shadow-2xl mb-6"
            onClick={() => window.open('https://whatsapp.com/channel/0029VbBFv6EDp2QAr8t8vR3w', '_blank')}
            data-testid="button-whatsapp-footer"
          >
            <MessageCircle className="h-6 w-6 mr-2 fill-indigo-600" />
            Connect with Immortals on WhatsApp
          </Button>
          <p className="text-2xl font-semibold text-white italic mt-8">
            "The day humanity stops dying and starts evolving — begins with WytLife."
          </p>
        </div>
      </section>
    </div>
  );
}
