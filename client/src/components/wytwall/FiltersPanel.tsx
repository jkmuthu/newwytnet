import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Briefcase, Home, Package, Wrench, Grid, MapPin, ChevronDown, X } from "lucide-react";
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
}

const CATEGORIES = [
  { id: "all", label: "All Offers", icon: Grid },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "real_estate", label: "Real Estate", icon: Home },
  { id: "b2b_supply", label: "B2B Supply", icon: Package },
  { id: "service", label: "Services", icon: Wrench },
  { id: "other", label: "Other", icon: Grid },
];

export default function FiltersPanel({ 
  selectedCategory, 
  onCategoryChange, 
  categoryCounts = {},
  selectedLocation = "",
  onLocationChange
}: FiltersPanelProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Fetch India cities from WytData module
  const { data: citiesData, isLoading: citiesLoading } = useQuery<any>({
    queryKey: ['/api/modules/wytdata/india-cities'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const cities = citiesData?.items || [];

  // Filter cities based on search
  const filteredCities = cities.filter((city: any) => {
    const cityName = city.label || city.name || '';
    const cityState = city.metadata?.state || city.state || '';
    return cityName.toLowerCase().includes(locationSearch.toLowerCase()) ||
      cityState.toLowerCase().includes(locationSearch.toLowerCase());
  }).slice(0, 10);

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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location
        </CardTitle>
      </CardHeader>
      
      <Separator className="dark:bg-gray-700" />
      
      <CardContent className="pt-4 space-y-4">
        
        {/* Location Filter - Now at top */}
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
                    placeholder="Search cities..." 
                    value={locationSearch}
                    onValueChange={setLocationSearch}
                    data-testid="input-location-search"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {citiesLoading ? "Loading cities..." : "No city found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {/* Nearby option first */}
                      <CommandItem
                        value="nearby"
                        onSelect={() => handleCitySelect("Nearby")}
                        data-testid="location-option-nearby"
                      >
                        <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="font-medium">Nearby</span>
                        <span className="ml-auto text-xs text-gray-500">
                          Use my location
                        </span>
                      </CommandItem>
                      
                      {/* City options */}
                      {filteredCities.map((city: any) => {
                        const cityName = city.label || city.name;
                        const cityState = city.metadata?.state || city.state;
                        return (
                          <CommandItem
                            key={city.code || cityName}
                            value={cityName}
                            onSelect={() => handleCitySelect(cityName)}
                            data-testid={`location-option-${cityName.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{cityName}</span>
                            {cityState && (
                              <span className="ml-auto text-xs text-gray-500">
                                {cityState}
                              </span>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <Separator className="dark:bg-gray-700" />

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

      </CardContent>
    </>
  );
}
