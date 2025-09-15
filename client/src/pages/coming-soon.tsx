import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Zap, Star, Bell } from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

export default function ComingSoon() {
  const { isMobile } = useDeviceDetection();
  
  // Get the current path to show which tool this is
  const currentPath = window.location.pathname;
  const toolName = currentPath.split('/')[1]?.replace('-', ' ') || 'Tool';
  const formattedToolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 dark:text-white mb-4`}>
            {formattedToolName} Coming Soon!
          </h1>
          
          {/* Description */}
          <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-600 dark:text-gray-300 mb-8 leading-relaxed`}>
            We're working hard to bring you this amazing tool. It will be available soon with powerful features to boost your productivity.
          </p>

          {/* Status Card */}
          <Card className="mb-8 border-2 border-dashed border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-400">
                  <Zap className="h-3 w-3 mr-1" />
                  In Development
                </Badge>
              </div>
              <CardTitle className="text-center">Development Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expected launch: Coming weeks
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 justify-center`}>
            <Link href="/">
              <Button 
                size="lg" 
                className={`${isMobile ? 'w-full' : ''} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
                data-testid="button-explore-tools"
              >
                <Zap className="h-5 w-5 mr-2" />
                Explore Available Tools
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className={`${isMobile ? 'w-full' : ''}`}
              onClick={() => {
                // Simple notification - in a real app you'd integrate with your notification system
                alert('Thanks for your interest! We\'ll notify you when this tool is ready.');
              }}
              data-testid="button-notify-me"
            >
              <Bell className="h-5 w-5 mr-2" />
              Notify Me When Ready
            </Button>
          </div>
          
          {/* Footer Note */}
          <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> Check back regularly or follow us for updates on new tool releases!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}