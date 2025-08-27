import { useState, useEffect } from 'react';
import { useUpdatePlace } from '@/hooks/use-places';
import { validatePlaceForm, hasFormErrors } from '@/lib/place-validation';
import type { Place } from '@/types/place';
import type { PlaceFormData, FormErrors } from '@/types/place-form';
import { DEFAULT_OPENING_HOURS } from '@/types/place-form';
import { GeneralInfoSection } from './form-sections/GeneralInfoSection';
import { AddressSearchSection } from './form-sections/AddressSearchSection';
import { ManualCoordinatesSection } from './form-sections/ManualCoordinatesSection';
import { OpeningHoursSection } from './form-sections/OpeningHoursSection';
import { FormActionsSection } from './form-sections/FormActionsSection';

interface EditPlaceFormProps {
  place: Place;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPlaceForm({ place, onSuccess, onCancel }: EditPlaceFormProps) {
  const updatePlace = useUpdatePlace();
  
  const parseOpeningHoursFromBackend = (timeString?: string): { [key: string]: any } | null => {
    // For now, return default hours. Could be enhanced to parse the time string.
    if (!timeString || timeString === 'Hours not specified') {
      return null;
    }
    return DEFAULT_OPENING_HOURS;
  };

  const [formData, setFormData] = useState<PlaceFormData>({
    name: place.name,
    address: place.address,
    category: place.category,
    imageUrl: place.imageUrl || '',
    coordinates: place.coordinates,
    formattedAddress: place.formattedAddress,
    // Use structured opening hours if available, otherwise parse from time string, otherwise use defaults
    openingHours: place.openingHours || parseOpeningHoursFromBackend(place.time) || DEFAULT_OPENING_HOURS,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Validate form whenever data changes
  useEffect(() => {
    const newErrors = validatePlaceForm(formData);
    setErrors(newErrors);
  }, [formData]);

  const handleChange = (updates: Partial<PlaceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validatePlaceForm(formData);
    setErrors(validationErrors);

    if (hasFormErrors(validationErrors)) {
      return;
    }

    // If address is empty but we have coordinates, generate a basic address
    let addressToUse = formData.address;
    if (!addressToUse && formData.coordinates) {
      addressToUse = `Location: ${formData.coordinates.lat.toFixed(6)}, ${formData.coordinates.lng.toFixed(6)}`;
    }

    // Ensure we have an address for validation
    if (!addressToUse || !addressToUse.trim()) {
      setErrors({ address: 'Please provide a name/address for the place' });
      return;
    }

    try {
      const placeData = {
        name: formData.name,
        address: addressToUse,
        category: formData.category,
        imageUrl: formData.imageUrl,
        coordinates: formData.coordinates,
        formattedAddress: formData.formattedAddress || addressToUse,
        // Keep legacy time field for backward compatibility
        time: formatOpeningHoursForBackend(formData.openingHours),
        // Send structured opening hours data
        openingHours: formData.openingHours,
      };

      await updatePlace.mutateAsync({
        id: place._id,
        data: placeData
      });
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const formatOpeningHoursForBackend = (openingHours?: { [key: string]: any }): string => {
    if (!openingHours) return 'Hours not specified';
    
    // For now, just use a simple format. Could be enhanced later.
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openDays = days.filter(day => !openingHours[day]?.closed);
    
    if (openDays.length === 0) return 'Closed';
    if (openDays.length === 7) {
      const firstDay = openingHours[days[0]];
      return `Daily ${firstDay.open} - ${firstDay.close}`;
    }
    
    return `${openDays.length} days/week`;
  };

  const isFormValid = !hasFormErrors(errors) && !!formData.name.trim() && !!formData.category;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GeneralInfoSection
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />

      <AddressSearchSection
        formData={formData}
        errors={errors}
        onChange={handleChange}
        rememberSelection={false}
      />

      <ManualCoordinatesSection
        formData={formData}
        errors={errors}
        onChange={handleChange}
        isEdit={true}
      />

      <OpeningHoursSection
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />

      <FormActionsSection
        isSubmitting={updatePlace.isPending}
        onCancel={onCancel}
        submitText="Update Place"
        isValid={isFormValid}
      />
    </form>
  );
}
