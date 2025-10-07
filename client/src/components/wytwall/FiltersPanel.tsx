import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Home, Package, Wrench, Grid, MapPin, DollarSign } from "lucide-react";

interface FiltersPanelProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORIES = [
  { id: "all", label: "All Needs", icon: Grid },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "real_estate", label: "Real Estate", icon: Home },
  { id: "b2b_supply", label: "B2B Supply", icon: Package },
  { id: "service", label: "Services", icon: Wrench },
  { id: "other", label: "Other", icon: Grid },
];

export default function FiltersPanel({ selectedCategory, onCategoryChange, categoryCounts = {} }: FiltersPanelProps) {
  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </CardTitle>
      </CardHeader>
      
      <Separator className="dark:bg-gray-700" />
      
      <CardContent className="pt-4 space-y-4">
        
        {/* Category Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Categories
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const count = categoryCounts[category.id] || 0;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    isSelected 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => onCategoryChange(category.id)}
                  data-testid={`filter-category-${category.id}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="flex-1">{category.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant={isSelected ? "secondary" : "outline"}
                      className={`ml-2 ${isSelected ? "bg-blue-500 text-white border-blue-400" : ""}`}
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Location Filter (Future) */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon...</p>
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Budget Filter (Future) */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Budget Range
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon...</p>
        </div>

      </CardContent>
    </>
  );
}
