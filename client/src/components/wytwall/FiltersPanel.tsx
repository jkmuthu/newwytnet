import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Briefcase, Home, Package, Wrench, Grid, MapPin, DollarSign, ChevronDown } from "lucide-react";

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
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [location, setLocation] = useState("");

  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </CardTitle>
      </CardHeader>
      
      <Separator className="dark:bg-gray-700" />
      
      <CardContent className="pt-4 space-y-4">
        
        {/* Category Filters - Collapsible */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categories
            </h3>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
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
          </CollapsibleContent>
        </Collapsible>

        <Separator className="dark:bg-gray-700" />

        {/* Location Filter - Collapsible */}
        <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </h3>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            <Input
              placeholder="Enter city or region..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
              data-testid="input-location-filter"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filter by location (Coming soon)
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="dark:bg-gray-700" />

        {/* Price Range Filter - Collapsible */}
        <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Price Range
            </h3>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={100000}
              step={1000}
              className="w-full"
              data-testid="slider-price-range"
            />
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">₹{priceRange[0].toLocaleString()}</span>
              <span className="text-gray-400">-</span>
              <span className="font-medium">₹{priceRange[1].toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filter by budget (Coming soon)
            </p>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </>
  );
}
