import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSuggestion {
  eLoc: string;
  placeName: string;
  placeAddress: string;
  type: string;
}

interface MapplsLocationPickerProps {
  value?: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export default function MapplsLocationPicker({
  value = "",
  onChange,
  placeholder = "Search for a location...",
  className,
  disabled = false,
  "data-testid": testId,
}: MapplsLocationPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
    setSelectedLocation(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/mappls/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestedLocations || []);
      }
    } catch (error) {
      console.error("Location search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setSelectedLocation("");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    const locationText = suggestion.placeAddress || suggestion.placeName;
    setInputValue(locationText);
    setSelectedLocation(locationText);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(locationText);
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedLocation("");
    setSuggestions([]);
    onChange("");
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (inputValue && !selectedLocation) {
        onChange(inputValue);
        setSelectedLocation(inputValue);
      }
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
          data-testid={testId}
        />
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {inputValue && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.eLoc}-${index}`}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              onClick={() => handleSelectLocation(suggestion)}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {suggestion.placeName}
                </div>
                {suggestion.placeAddress && suggestion.placeAddress !== suggestion.placeName && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {suggestion.placeAddress}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && inputValue.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
          No locations found. You can type your location manually.
        </div>
      )}
    </div>
  );
}
