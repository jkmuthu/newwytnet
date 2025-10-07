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
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02] cursor-pointer" data-testid={`need-card-${need.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={need.user?.profileImageUrl} />
              <AvatarFallback className="bg-blue-600 text-white">
                {need.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {need.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
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
          <Badge className={categoryColors[need.category] || categoryColors.other}>
            {need.category.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
          {need.description}
        </p>
        
        {/* Details */}
        <div className="flex flex-wrap gap-3 mt-3">
          {need.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              {need.location}
            </div>
          )}
          {need.budget && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="h-4 w-4" />
              {need.currency} {need.budget}
            </div>
          )}
          {need.isSponsored && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Star className="h-3 w-3 mr-1" />
              Sponsored
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t dark:border-gray-700 pt-3">
        <Button
          onClick={handleOfferClick}
          className={`w-full ${
            isAuthenticated
              ? "bg-blue-600 hover:bg-blue-700 text-white"
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
