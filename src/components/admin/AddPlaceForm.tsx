import { useState, useEffect } from 'react';
import { useCreatePlace } from '@/hooks/use-places';
import { validatePlaceForm, hasFormErrors } from '@/lib/place-validation';
import { enhancedGeoapifyService } from '@/services/enhanced-geoapify.service';
import type { PlaceFormData, FormErrors } from '@/types/place-form';
import { DEFAULT_OPENING_HOURS } from '@/types/place-form';
import { GeneralInfoSection } from './form-sections/GeneralInfoSection';
import { AddressSearchSection } from './form-sections/AddressSearchSection';
import { ManualCoordinatesSection } from './form-sections/ManualCoordinatesSection';
import { OpeningHoursSection } from './form-sections/OpeningHoursSection';
import { FormActionsSection } from './form-sections/FormActionsSection';

interface AddPlaceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddPlaceForm({ onSuccess, onCancel }: AddPlaceFormProps) {
  const createPlace = useCreatePlace();
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    address: '',
    category: '',
    imageUrl: '',
    coordinates: undefined,
    formattedAddress: undefined,
    openingHours: DEFAULT_OPENING_HOURS,
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

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      category: '',
      imageUrl: '',
      coordinates: undefined,
      formattedAddress: undefined,
      openingHours: DEFAULT_OPENING_HOURS,
    });
    setErrors({});
    enhancedGeoapifyService.clearRememberedPlace();
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

      await createPlace.mutateAsync(placeData);
      resetForm();
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
        rememberSelection={true}
      />

      <ManualCoordinatesSection
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />

      <OpeningHoursSection
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />

      <FormActionsSection
        isSubmitting={createPlace.isPending}
        onCancel={onCancel}
        submitText="Create Place"
        isValid={isFormValid}
      />
    </form>
  );
}
