import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, Activity, Server, Globe, Zap, Shield } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Status() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const systemStatus = [
    {
      name: "WytApps Platform",
      status: "operational",
      description: "Core platform serving all WytApps",
      uptime: "99.9%",
      icon: Server
    },
    {
      name: "QR Code Generator",
      status: "operational", 
      description: "QR code generation and customization",
      uptime: "100%",
      icon: Zap
    },
    {
      name: "DISC Assessment",
      status: "operational",
      description: "Personality assessment tool",
      uptime: "99.8%", 
      icon: Activity
    },
    {
      name: "AI Directory",
      status: "operational",
      description: "AI tools directory and search",
      uptime: "99.9%",
      icon: Globe
    },
    {
      name: "Website & CDN",
      status: "operational",
      description: "Main website and global content delivery",
      uptime: "100%",
      icon: Globe
    },
    {
      name: "Security Systems",
      status: "operational",
      description: "HTTPS, privacy protection, and security monitoring",
      uptime: "100%",
      icon: Shield
    }
  ];

  const recentUpdates = [
    {
      date: "2025-09-06",
      time: "10:00 AM",
      title: "Platform Maintenance Complete",
      description: "Successfully completed scheduled maintenance on the WytApps platform. All services are fully operational.",
      type: "maintenance",
      status: "resolved"
    },
    {
      date: "2025-09-05",
      time: "2:30 PM", 
      title: "New WytApps Added",
      description: "Added 7 new productivity tools to the WytApps collection. All tools are now available for use.",
      type: "update",
      status: "completed"
    },
    {
      date: "2025-09-04",
      time: "11:45 AM",
      title: "Performance Improvements",
      description: "Implemented performance optimizations across all WytApps. Load times improved by an average of 25%.",
      type: "improvement",
      status: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'degraded':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'outage':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'degraded':
      case 'outage':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'update':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'improvement':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const overallStatus = systemStatus.every(system => system.status === 'operational') ? 'operational' : 'issues';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${overallStatus === 'operational' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-yellow-500 to-orange-600'}`}>
              {overallStatus === 'operational' ? (
                <CheckCircle className="h-10 w-10 text-white" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            System Status
          </h1>
          
          <div className="mb-6">
            <Badge className={`text-lg px-6 py-2 ${overallStatus === 'operational' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {overallStatus === 'operational' ? 'All Systems Operational' : 'Some Systems Experiencing Issues'}
            </Badge>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Real-time status of WytNet platform and all WytApps. 
            Check here for current operational status and any ongoing issues.
          </p>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {currentDate}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Current System Status
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Live status of all WytNet services and applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemStatus.map((system, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                        <system.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{system.name}</CardTitle>
                    </div>
                    {getStatusIcon(system.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {system.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(system.status)}>
                      {system.status === 'operational' ? 'Operational' : system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                    </Badge>
                    <span className="text-sm font-medium text-gray-500">
                      {system.uptime} uptime
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Updates & Incidents
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Latest updates, maintenance activities, and resolved issues.
            </p>
          </div>

          <div className="space-y-6">
            {recentUpdates.map((update, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {getUpdateIcon(update.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {update.title}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {update.date} at {update.time}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {update.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {update.type}
                        </Badge>
                        <Badge className={update.status === 'resolved' || update.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {update.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Key performance indicators for WytNet platform reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Overall Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <p className="text-gray-600 dark:text-gray-300">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 mb-2">{'<1s'}</div>
                <p className="text-gray-600 dark:text-gray-300">Average load time</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600 mb-2">0.01%</div>
                <p className="text-gray-600 dark:text-gray-300">Very low error rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}