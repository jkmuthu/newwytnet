import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Shield, Award, QrCode, Brain, Globe, ArrowRight, Star 
} from "lucide-react";

interface PublicAppSidebarProps {
  isAuthenticated: boolean;
  currentApp?: string;
}

export default function PublicAppSidebar({ isAuthenticated, currentApp }: PublicAppSidebarProps) {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-4">
      {!isAuthenticated && (
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-lg hover:scale-105 transition-all rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <div className="h-9 w-9 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-0.5">Join and Get WytPass</h3>
                <p className="text-xs text-white/90">Sign up today and get your WytPass identity</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-white/90 hover:bg-white text-purple-600 font-semibold shadow-lg rounded-lg h-8 text-xs"
              data-testid="button-join-wytpass"
            >
              Sign Up Free
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && (
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-lg hover:scale-105 transition-all rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <div className="h-9 w-9 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-0.5">Earn WytPoints to Become a WytStar</h3>
                <p className="text-xs text-white/90">Contribute to the marketplace and climb the leaderboard!</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/wytpoints')}
              className="w-full bg-white/90 hover:bg-white text-orange-600 font-semibold shadow-lg rounded-lg h-8 text-xs"
              data-testid="button-earn-wytpoints"
            >
              View Leaderboard
              <Star className="h-3 w-3 ml-1 fill-current" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-lg hover:scale-105 transition-all rounded-xl overflow-hidden cursor-pointer" onClick={() => navigate('/wytwall')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 mb-3">
            <div className="h-9 w-9 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-0.5">Explore WytWall</h3>
              <p className="text-xs text-white/90">Discover opportunities and connect with others</p>
            </div>
          </div>
          <Button
            onClick={(e) => { e.stopPropagation(); navigate('/wytwall'); }}
            className="w-full bg-white/90 hover:bg-white text-blue-600 font-semibold shadow-lg rounded-lg h-8 text-xs"
            data-testid="button-wytwall"
          >
            Visit WytWall
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {currentApp !== 'wytqrc' && (
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg hover:scale-105 transition-all rounded-xl overflow-hidden cursor-pointer" onClick={() => navigate('/a/wytqrc')}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <div className="h-9 w-9 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-0.5">Create QR Codes</h3>
                <p className="text-xs text-white/90">Generate QR codes instantly with WytQRC</p>
              </div>
            </div>
            <Button
              onClick={(e) => { e.stopPropagation(); navigate('/a/wytqrc'); }}
              className="w-full bg-white/90 hover:bg-white text-emerald-600 font-semibold shadow-lg rounded-lg h-8 text-xs"
              data-testid="button-qr-generator"
            >
              QR Generator
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {currentApp !== 'wytassessor' && (
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-lg hover:scale-105 transition-all rounded-xl overflow-hidden cursor-pointer" onClick={() => navigate('/a/wytassessor')}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <div className="h-9 w-9 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-0.5">Assess your DISC</h3>
                <p className="text-xs text-white/90">Discover your personality type</p>
              </div>
            </div>
            <Button
              onClick={(e) => { e.stopPropagation(); navigate('/a/wytassessor'); }}
              className="w-full bg-white/90 hover:bg-white text-purple-600 font-semibold shadow-lg rounded-lg h-8 text-xs"
              data-testid="button-disc-assessment"
            >
              DISC Assessment
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
