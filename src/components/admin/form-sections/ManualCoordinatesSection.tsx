import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlaceFormData, FormErrors } from '@/types/place-form';

interface ManualCoordinatesSectionProps {
  formData: PlaceFormData;
  errors: FormErrors;
  onChange: (updates: Partial<PlaceFormData>) => void;
  isEdit?: boolean;
}

export function ManualCoordinatesSection({ 
  formData, 
  errors, 
  onChange, 
  isEdit = false 
}: ManualCoordinatesSectionProps) {
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    const newCoords = isNaN(lat) ? undefined : {
      lat,
      lng: formData.coordinates?.lng || 0
    };
    
    // Only auto-generate address if it's completely empty
    let newAddress = formData.address;
    if (newCoords && newCoords.lng !== 0 && !formData.address.trim()) {
      newAddress = `Location: ${lat.toFixed(6)}, ${newCoords.lng.toFixed(6)}`;
    }
    
    onChange({
      coordinates: newCoords,
      address: newAddress
    });
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    const newCoords = isNaN(lng) ? undefined : {
      lat: formData.coordinates?.lat || 0,
      lng
    };
    
    // Only auto-generate address if it's completely empty
    let newAddress = formData.address;
    if (newCoords && newCoords.lat !== 0 && !formData.address.trim()) {
      newAddress = `Location: ${newCoords.lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    
    onChange({
      coordinates: newCoords,
      address: newAddress
    });
  };

  const idPrefix = isEdit ? 'edit-' : '';

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-muted-foreground">
        Manual Coordinates <span className="text-muted-foreground">(if address search fails)</span>
      </Label>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}latitude`} className="text-xs">
            Latitude
          </Label>
          <Input
            id={`${idPrefix}latitude`}
            type="number"
            step="any"
            placeholder="16.047079"
            value={formData.coordinates?.lat || ''}
            onChange={handleLatitudeChange}
            className={`text-xs ${errors.coordinates ? 'border-destructive' : ''}`}
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}longitude`} className="text-xs">
            Longitude
          </Label>
          <Input
            id={`${idPrefix}longitude`}
            type="number"
            step="any"
            placeholder="108.206230"
            value={formData.coordinates?.lng || ''}
            onChange={handleLongitudeChange}
            className={`text-xs ${errors.coordinates ? 'border-destructive' : ''}`}
          />
        </div>
      </div>
      
      {errors.coordinates && (
        <p className="text-sm text-destructive">{errors.coordinates}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Enter coordinates if address search fails. Address field above remains editable.
      </p>
    </div>
  );
}
