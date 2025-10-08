import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, MessageSquare, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NeedCardProps {
  need: any;
  isAuthenticated: boolean;
  onMakeOffer?: (needId: string) => void;
  onLogin?: () => void;
}

export default function NeedCard({ need, isAuthenticated, onMakeOffer, onLogin }: NeedCardProps) {
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
      onMakeOffer?.(need.id);
    }
  };

  return (
    <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 overflow-hidden" data-testid={`need-card-${need.id}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-11 w-11 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 transition-all">
              <AvatarImage src={need.user?.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                {need.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {need.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {need.user?.name || "Anonymous"}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(need.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <Badge className={`${categoryColors[need.category] || categoryColors.other} font-semibold`}>
            {need.category.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-gray-700 dark:text-gray-300 text-base line-clamp-3 leading-relaxed">
          {need.description}
        </p>
        
        {/* Details */}
        <div className="flex flex-wrap gap-4 mt-4">
          {need.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{need.location}</span>
            </div>
          )}
          {need.budget && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-medium">{need.currency} {need.budget}</span>
            </div>
          )}
          {need.isSponsored && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
              <Star className="h-3 w-3 mr-1 fill-yellow-400" />
              Sponsored
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-800/50">
        <Button
          onClick={handleOfferClick}
          className={`w-full font-semibold ${
            isAuthenticated
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          disabled={!isAuthenticated && !onLogin}
          data-testid={`button-make-offer-${need.id}`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {isAuthenticated ? "Make an Offer" : "Login to Make Offer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
