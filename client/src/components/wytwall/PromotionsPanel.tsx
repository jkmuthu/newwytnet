import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Sparkles, Trophy, Zap, Gift, ExternalLink, Star } from "lucide-react";

interface PromotionsPanelProps {
  isAuthenticated: boolean;
}

export default function PromotionsPanel({ isAuthenticated }: PromotionsPanelProps) {
  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Quick Links
        </CardTitle>
      </CardHeader>
      
      <Separator className="dark:bg-gray-700" />
      
      <CardContent className="pt-4 space-y-4">
        
        {/* WytStar Promotion */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Earn WytStars
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Contribute to the marketplace and climb the leaderboard!
              </p>
              <Link href="/wytstar">
                <Button size="sm" variant="outline" className="w-full" data-testid="link-wytstar">
                  View Leaderboard
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* WytPoints Promotion */}
        {isAuthenticated && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  WytPoints Balance
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Use points to unlock premium features
                </p>
                <Link href="/panel/me/points">
                  <Button size="sm" variant="outline" className="w-full" data-testid="link-points">
                    Manage Points
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <Separator className="dark:bg-gray-700" />

        {/* WytApps */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Featured Apps
          </h3>
          <div className="space-y-2">
            <Link href="/wytapps">
              <Button variant="ghost" className="w-full justify-start text-left" data-testid="link-wytapps">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1.5 rounded">
                    <Star className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Browse All Apps</span>
                </div>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/qr-generator">
              <Button variant="ghost" className="w-full justify-start text-left" data-testid="link-qr-generator">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded">
                    <Zap className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">QR Generator</span>
                </div>
              </Button>
            </Link>
            <Link href="/assessment">
              <Button variant="ghost" className="w-full justify-start text-left" data-testid="link-assessment">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded">
                    <Trophy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">DISC Assessment</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
              Join WytNet Today
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Create an account to post needs, make offers, and earn rewards
            </p>
            <Link href="/login">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-signup">
                Sign Up Free
              </Button>
            </Link>
          </div>
        )}

      </CardContent>
    </>
  );
}
