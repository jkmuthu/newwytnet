import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, MessageSquare, Star, ChevronDown, ChevronUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NeedCardProps {
  need: any;
  isAuthenticated: boolean;
  onMakeOffer?: (need: any) => void;
  onLogin?: () => void;
  isCollapsed?: boolean;
}

export default function NeedCard({ need, isAuthenticated, onMakeOffer, onLogin, isCollapsed = false }: NeedCardProps) {
  const [expanded, setExpanded] = useState(!isCollapsed);
  const categoryColors: Record<string, string> = {
    jobs: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    real_estate: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    b2b_supply: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    service: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const handleOfferClick = () => {
    if (!isAuthenticated) {
      onLogin?.();
    } else {
      onMakeOffer?.(need);
    }
  };

  return (
    <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden rounded-xl sm:rounded-2xl" data-testid={`need-card-${need.id}`}>
      <div className="absolute top-0 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className={`px-3 sm:px-6 py-3 sm:py-4 ${expanded ? 'pb-2 sm:pb-3' : 'pb-2'}`}>
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {expanded && (
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 transition-all flex-shrink-0">
                <AvatarImage src={need.user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm">
                  {need.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-gray-900 dark:text-white ${expanded ? 'text-sm sm:text-base' : 'text-sm'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 sm:truncate`}>
                {need.title}
              </h3>
              {expanded && (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                    {need.user?.name || "Anonymous"}
                  </span>
                  <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hidden sm:flex">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {formatDistanceToNow(new Date(need.createdAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Badge className={`${categoryColors[need.category] || categoryColors.other} font-semibold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5`}>
              {need.category.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-manipulation"
              data-testid={`button-expand-${need.id}`}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {need.description}
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
              {need.location && (
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{need.location}</span>
                </div>
              )}
              {need.budget && (
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{need.currency} {need.budget}</span>
                </div>
              )}
              {need.isSponsored && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-[10px] sm:text-xs">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 fill-yellow-400" />
                  Sponsored
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-3 sm:px-6 border-t border-gray-200 dark:border-gray-700 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="w-full flex items-center gap-3">
              {/* Response Count Badge */}
              {(need.responseCount > 0 || need.offersCount > 0) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium">{need.responseCount || need.offersCount}</span>
                  <span className="hidden sm:inline">response{(need.responseCount || need.offersCount) !== 1 ? 's' : ''}</span>
                </div>
              )}
              <Button
                onClick={handleOfferClick}
                className={`flex-1 font-semibold text-xs sm:text-sm h-9 sm:h-10 ${
                  isAuthenticated
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                disabled={!isAuthenticated && !onLogin}
                data-testid={`button-make-offer-${need.id}`}
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {isAuthenticated ? "Make an Offer" : "Login to Make Offer"}
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
