import { Label } from '@/components/ui/label';
import AddressSearchBox from '@/components/common/AddressSearchBox';
import type { PlaceFormData, FormErrors } from '@/types/place-form';
import type { PlaceAutocompleteResult } from '@/services/geoapify.service';

interface AddressSearchSectionProps {
  formData: PlaceFormData;
  errors: FormErrors;
  onChange: (updates: Partial<PlaceFormData>) => void;
  rememberSelection?: boolean;
}

export function AddressSearchSection({ 
  formData, 
  errors, 
  onChange, 
  rememberSelection = true 
}: AddressSearchSectionProps) {
  const handlePlaceSelect = (place: PlaceAutocompleteResult) => {
    onChange({
      name: formData.name || place.name, // Only set if name is empty
      address: place.formattedAddress,
      coordinates: place.coordinates,
      formattedAddress: place.formattedAddress,
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address" className="text-sm font-medium">
        Address <span className="text-muted-foreground">(or use coordinates below)</span>
      </Label>
      <AddressSearchBox
        value={formData.address}
        onChange={(address) => onChange({ address })}
        onPlaceSelect={handlePlaceSelect}
        placeholder="Search for restaurants, cafes, bars..."
        showCurrentLocation={true}
        bias="countrycode:vn"
        rememberSelection={rememberSelection}
      />
      {errors.address && (
        <p className="text-sm text-destructive">{errors.address}</p>
      )}
    </div>
  );
}
