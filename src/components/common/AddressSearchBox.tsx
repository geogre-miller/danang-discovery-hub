import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react';
import { PlaceAutocompleteResult } from '@/services/geoapify.service';
import { enhancedGeoapifyService } from '@/services/enhanced-geoapify.service';
import { cn } from '@/lib/utils';

export interface AddressSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceAutocompleteResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showCurrentLocation?: boolean;
  bias?: string; // e.g., "countrycode:vn"
  autoFocus?: boolean;
  /** When true, remembers the last selected place and avoids re-fetching */
  rememberSelection?: boolean;
}

export default function AddressSearchBox({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for addresses...",
  className,
  disabled = false,
  showCurrentLocation = true,
  bias = "countrycode:vn",
  autoFocus = false,
  rememberSelection = true
}: AddressSearchBoxProps) {
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelectedPlace, setHasSelectedPlace] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isUserTyping = useRef(false);
  const lastSelectedPlace = useRef<PlaceAutocompleteResult | null>(null);

  // Load remembered place on mount
  useEffect(() => {
    if (rememberSelection && !value) {
      const remembered = enhancedGeoapifyService.getRememberedPlace();
      if (remembered) {
        lastSelectedPlace.current = remembered;
        onChange(remembered.formattedAddress);
        setHasSelectedPlace(true);
      }
    }
  }, [rememberSelection, value, onChange]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input changes with debounced search
  const handleInputChange = useCallback(async (inputValue: string) => {
    onChange(inputValue);
    isUserTyping.current = true;
    setHasSelectedPlace(false);
    setSelectedIndex(-1);

    // Don't search for very short queries
    if (inputValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    // If this matches the last selected place, don't fetch again
    if (lastSelectedPlace.current && 
        inputValue.trim() === lastSelectedPlace.current.formattedAddress.trim()) {
      setShowSuggestions(false);
      setHasSelectedPlace(true);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(true);

    try {
      const results = await enhancedGeoapifyService.debouncedAutocomplete(inputValue, {
        limit: 5,
        bias: bias
      });

      // Only update if user is still typing the same query
      if (isUserTyping.current && inputValue === value) {
        setSuggestions(results);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [onChange, bias, value]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((place: PlaceAutocompleteResult) => {
    isUserTyping.current = false;
    lastSelectedPlace.current = place;
    
    onChange(place.formattedAddress);
    onPlaceSelect(place);
    setShowSuggestions(false);
    setHasSelectedPlace(true);
    setSelectedIndex(-1);

    // Remember selection for future use
    if (rememberSelection) {
      enhancedGeoapifyService.rememberSelectedPlace(place);
    }

    // Blur input to hide mobile keyboard
    inputRef.current?.blur();
  }, [onChange, onPlaceSelect, rememberSelection]);

  // Handle current location
  const handleCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      const place = await enhancedGeoapifyService.autocomplete(`${latitude},${longitude}`);
      if (place.length > 0) {
        handleSelectSuggestion(place[0]);
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      alert('Unable to get your current location. Please search manually.');
    } finally {
      setIsLoading(false);
    }
  }, [handleSelectSuggestion]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSelectSuggestion]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (!hasSelectedPlace && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [hasSelectedPlace, suggestions.length]);

  // Handle input blur (with delay to allow clicking suggestions)
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSelectedPlace(false);
    setSelectedIndex(-1);
    lastSelectedPlace.current = null;
    isUserTyping.current = false;
    
    if (rememberSelection) {
      enhancedGeoapifyService.clearRememberedPlace();
    }
    
    inputRef.current?.focus();
  }, [onChange, rememberSelection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      enhancedGeoapifyService.cancelPendingRequests();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 pr-20",
            hasSelectedPlace && "border-green-500 bg-green-50/50"
          )}
          autoComplete="off"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {value && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {showCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCurrentLocation}
              className="h-6 w-6 p-0"
              title="Use current location"
            >
              <Navigation className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            <div ref={suggestionsRef} className="max-h-60 overflow-y-auto">
              {suggestions.map((place, index) => (
                <div
                  key={place.id}
                  className={cn(
                    "p-3 cursor-pointer border-b last:border-b-0 transition-colors",
                    "hover:bg-muted/50",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => handleSelectSuggestion(place)}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{place.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {place.formattedAddress}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status indicator for remembered place */}
      {hasSelectedPlace && lastSelectedPlace.current && (
        <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Location selected
        </div>
      )}
    </div>
  );
}
