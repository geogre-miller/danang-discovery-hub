import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { geoapifyService, type PlaceAutocompleteResult } from '@/services/geoapify.service';

interface GeoapifyAutocompleteProps {
  onPlaceSelect: (place: PlaceAutocompleteResult) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  showCurrentLocation?: boolean;
  bias?: string;
}

export default function GeoapifyAutocomplete({
  onPlaceSelect,
  placeholder = "Search for a place...",
  value = "",
  disabled = false,
  className = "",
  showCurrentLocation = true,
  bias = "countrycode:vn"
}: GeoapifyAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const results = await geoapifyService.autocomplete(query, {
          limit: 8,
          bias: bias
        });
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Autocomplete error:', error);
        toast.error('Failed to load place suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, bias]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
  };

  const handleSuggestionClick = (place: PlaceAutocompleteResult) => {
    setQuery(place.address);
    setShowSuggestions(false);
    setSuggestions([]);
    onPlaceSelect(place);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await geoapifyService.getCurrentLocation();
      if (location) {
        const result = await geoapifyService.reverseGeocode(location.lat, location.lng);
        if (result) {
          setQuery(result.address);
          onPlaceSelect(result);
          toast.success('Current location detected');
        } else {
          toast.error('Could not identify current location address');
        }
      } else {
        toast.error('Location access denied or unavailable');
      }
    } catch (error) {
      console.error('Current location error:', error);
      toast.error('Failed to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled}
            className="pl-10 pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" size={16} />
          )}
        </div>

        {showCurrentLocation && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCurrentLocation}
            disabled={disabled || isGettingLocation}
            title="Use current location"
          >
            {isGettingLocation ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation size={16} />
            )}
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto shadow-lg"
        >
          <div className="p-1">
            {suggestions.map((place, index) => (
              <button
                key={place.id}
                type="button"
                className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => handleSuggestionClick(place)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {place.name}
                    </div>
                    <div className="text-muted-foreground text-xs truncate">
                      {place.address}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
