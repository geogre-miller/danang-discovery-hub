import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  Navigation,
  LoaderCircle,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import {
  geoapifyService,
  type PlaceAutocompleteResult,
} from "@/services/geoapify.service";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onCoordinatesChange?: (
    coordinates: { lat: number; lng: number } | null
  ) => void;
  onFormattedAddressChange?: (formattedAddress: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showCurrentLocation?: boolean;
  bias?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onCoordinatesChange,
  onFormattedAddressChange,
  label = "Address",
  placeholder = "Start typing an address...",
  required = false,
  showCurrentLocation = true,
  bias = "countrycode:vn",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<PlaceAutocompleteResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<number>();

  // Debounced search with proper cleanup
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    // If the current value matches selected place, don't search again
    if (selectedPlace && value === selectedPlace.address) {
      return;
    }

    // Clear selected place if user is typing something different
    if (selectedPlace && value !== selectedPlace.address) {
      setSelectedPlace(null);
    }

    setIsLoading(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await geoapifyService.autocomplete(value, {
          limit: 8,
          bias: bias,
        });
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Autocomplete error:", error);
        toast.error("Failed to load place suggestions");
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [value, bias, selectedPlace]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Handle suggestion selection - prevents double fetching
  const handleSuggestionSelect = (place: PlaceAutocompleteResult) => {
    // Set the selected place FIRST to prevent re-fetching
    setSelectedPlace(place);

    // Close suggestions immediately
    setSuggestions([]);
    setShowSuggestions(false);

    // Update form values after setting selected place
    setTimeout(() => {
      onChange(place.address);
      onCoordinatesChange?.(place.coordinates);
      onFormattedAddressChange?.(place.formattedAddress);
    }, 0);

    inputRef.current?.blur();
  };

  // Handle current location
  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await geoapifyService.getCurrentLocation();
      if (location) {
        const result = await geoapifyService.reverseGeocode(
          location.lat,
          location.lng
        );
        if (result) {
          // Set selected place FIRST to prevent refetching
          setSelectedPlace(result);

          // Update form values after a short delay
          setTimeout(() => {
            onChange(result.address);
            onCoordinatesChange?.(result.coordinates);
            onFormattedAddressChange?.(result.formattedAddress);
          }, 0);

          toast.success("Current location detected");
        } else {
          toast.error("Could not identify current location address");
        }
      } else {
        toast.error("Location access denied or unavailable");
      }
    } catch (error) {
      console.error("Current location error:", error);
      toast.error("Failed to get current location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
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

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Label htmlFor="address">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id="address"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            required={required}
            className="pr-10"
          />
          <div className="absolute right-3 flex items-center justify-center h-4 w-4">
            {isLoading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <MapPin className="block h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {showCurrentLocation && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCurrentLocation}
            disabled={isGettingLocation}
            title="Use current location"
          >
            {isGettingLocation ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <Navigation size={16} />
            )}
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto"
        >
          <div className="p-1">
            {suggestions.map((place, index) => (
              <button
                key={place.id}
                type="button"
                className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => handleSuggestionSelect(place)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                  />
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
        </div>
      )}

      {showSuggestions &&
        suggestions.length === 0 &&
        !isLoading &&
        value.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md p-3">
            <div className="text-sm text-muted-foreground">
              No addresses found. Try a different search term.
            </div>
          </div>
        )}
    </div>
  );
}
