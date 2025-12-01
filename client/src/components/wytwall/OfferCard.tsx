import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Clock, DollarSign, Star, Handshake, ChevronDown, ChevronUp, Ban, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OfferCardProps {
  offer: any;
  isAuthenticated: boolean;
  currentUserId?: string;
  onViewOffer?: (offerId: string) => void;
  onLogin?: () => void;
  isCollapsed?: boolean;
}

export default function OfferCard({ offer, isAuthenticated, currentUserId, onViewOffer, onLogin, isCollapsed = false }: OfferCardProps) {
  const [expanded, setExpanded] = useState(!isCollapsed);
  
  // Check if current user is the post owner
  const isOwner = currentUserId && offer.userId && String(currentUserId) === String(offer.userId);
  const categoryColors: Record<string, string> = {
    jobs: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    real_estate: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    b2b_supply: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    service: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const handleViewClick = () => {
    if (!isAuthenticated) {
      onLogin?.();
    } else {
      onViewOffer?.(offer.id);
    }
  };

  return (
    <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 overflow-hidden" data-testid={`offer-card-${offer.id}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className={`${expanded ? 'pb-3' : 'pb-2'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {expanded && (
              <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-emerald-400 transition-all flex-shrink-0">
                <AvatarImage src={offer.user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-green-600 text-white font-semibold text-sm">
                  {offer.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-gray-900 dark:text-white ${expanded ? 'text-base' : 'text-sm'} group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate`}>
                {offer.title}
              </h3>
              {expanded && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                    {offer.user?.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {expanded && (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 font-semibold text-xs">
                Offer
              </Badge>
            )}
            <Badge className={`${categoryColors[offer.category] || categoryColors.other} font-semibold text-xs`}>
              {offer.category.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 p-0"
              data-testid={`button-expand-${offer.id}`}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <>
          <CardContent className="pb-4 pt-0">
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
              {offer.description}
            </p>
            
            {/* Details */}
            <div className="flex flex-wrap gap-3 mt-3">
              {offer.location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span className="font-medium">{offer.location}</span>
                </div>
              )}
              {offer.price && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{offer.currency} {offer.price}</span>
                </div>
              )}
              {offer.isSponsored && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                  Sponsored
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-3 bg-gray-50 dark:bg-gray-800/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      onClick={handleViewClick}
                      className={`w-full font-semibold text-sm ${
                        isOwner
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isAuthenticated
                            ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                      disabled={isOwner || (!isAuthenticated && !onLogin)}
                      data-testid={`button-view-offer-${offer.id}`}
                    >
                      {isOwner ? (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Your Offer
                        </>
                      ) : (
                        <>
                          <Handshake className="h-4 w-4 mr-2" />
                          {isAuthenticated ? "I'm Interested" : "Login to View Offer"}
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {isOwner && (
                  <TooltipContent>
                    You cannot respond to your own offer
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
