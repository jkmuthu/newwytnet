import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Briefcase, Home, Package, Wrench, Grid, MapPin, ChevronDown, X, Loader2, ShoppingBag, Car, Laptop, GraduationCap, Heart, Utensils, Building } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FiltersPanelProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  locationCounts?: Record<string, number>;
}

const CATEGORY_ICONS: Record<string, any> = {
  jobs: Briefcase,
  real_estate: Home,
  selling_property: Home,
  b2b_supply: Package,
  service: Wrench,
  require_service: Wrench,
  require_product: ShoppingBag,
  automotive: Car,
  technology: Laptop,
  education: GraduationCap,
  healthcare: Heart,
  food: Utensils,
  business: Building,
  other: Grid,
};

const CATEGORY_LABELS: Record<string, string> = {
  jobs: "Jobs",
  real_estate: "Real Estate",
  selling_property: "Selling Property",
  b2b_supply: "B2B Supply",
  service: "Services",
  require_service: "Services Needed",
  require_product: "Products Needed",
  automotive: "Automotive",
  technology: "Technology",
  education: "Education",
  healthcare: "Healthcare",
  food: "Food & Dining",
  business: "Business",
  other: "Other",
};

export default function FiltersPanel({ 
  selectedCategory, 
  onCategoryChange, 
  categoryCounts = {},
  selectedLocation = "",
  onLocationChange,
  locationCounts = {}
}: FiltersPanelProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Fetch locations with post counts from API
  const { data: locationsData, isLoading: locationsLoading } = useQuery<any>({
    queryKey: ['/api/wytwall/filters/locations'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch categories with post counts from API
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<any>({
    queryKey: ['/api/wytwall/filters/categories'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const locations = locationsData?.locations || [];
  const dynamicCategories = categoriesData?.categories || [];

  // Filter locations based on search
  const filteredLocations = locations.filter((loc: any) => 
    loc.name?.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Calculate total posts for "All" option
  const totalPosts = dynamicCategories.reduce((sum: number, cat: any) => sum + cat.count, 0);

  const handleCitySelect = (cityName: string) => {
    onLocationChange?.(cityName);
    setLocationSearch("");
    setShowCityDropdown(false);
  };

  const handleClearLocation = () => {
    onLocationChange?.("");
  };

  return (
    <>
      <CardContent className="pt-6 space-y-4">
        
        {/* Location Filter - Dynamic locations with posts only */}
        <div className="space-y-2">
          {selectedLocation ? (
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedLocation}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800"
                data-testid="button-clear-location"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Popover open={showCityDropdown} onOpenChange={setShowCityDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-select-location"
                >
                  <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  Select location...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search locations..." 
                    value={locationSearch}
                    onValueChange={setLocationSearch}
                    data-testid="input-location-search"
                  />
                  <CommandList>
                    {locationsLoading ? (
                      <div className="p-4 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading locations...</span>
                      </div>
                    ) : filteredLocations.length === 0 ? (
                      <CommandEmpty>
                        {locationSearch ? "No matching locations found." : "No locations with posts yet."}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup heading="Locations with posts">
                        {filteredLocations.map((location: any) => (
                          <CommandItem
                            key={location.name}
                            value={location.name}
                            onSelect={() => handleCitySelect(location.name)}
                            data-testid={`location-option-${location.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                              <span>{location.name}</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {location.count}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Category Filters - Dynamic from API */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categories
            </h3>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-1">
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading categories...</span>
                </div>
              ) : (
                <>
                  {/* All Categories Option */}
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    className={`w-full justify-start text-left h-9 ${
                      selectedCategory === "all"
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => onCategoryChange("all")}
                    data-testid="filter-category-all"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    <span className="flex-1">All Posts</span>
                    <Badge 
                      variant={selectedCategory === "all" ? "secondary" : "outline"}
                      className={`ml-2 text-xs ${selectedCategory === "all" ? "bg-blue-500 text-white border-blue-400" : ""}`}
                    >
                      {totalPosts}
                    </Badge>
                  </Button>

                  {/* Dynamic Categories - Only show categories that have posts */}
                  {dynamicCategories.map((category: any) => {
                    const Icon = CATEGORY_ICONS[category.name] || Grid;
                    const label = CATEGORY_LABELS[category.name] || category.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    const isSelected = selectedCategory === category.name;
                    
                    return (
                      <Button
                        key={category.name}
                        variant={isSelected ? "default" : "ghost"}
                        className={`w-full justify-start text-left h-9 ${
                          isSelected 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => onCategoryChange(category.name)}
                        data-testid={`filter-category-${category.name}`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="flex-1 truncate">{label}</span>
                        <Badge 
                          variant={isSelected ? "secondary" : "outline"}
                          className={`ml-2 text-xs ${isSelected ? "bg-blue-500 text-white border-blue-400" : ""}`}
                        >
                          {category.count}
                        </Badge>
                      </Button>
                    );
                  })}
                  
                  {dynamicCategories.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No categories with posts yet.
                    </p>
                  )}
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </>
  );
}
