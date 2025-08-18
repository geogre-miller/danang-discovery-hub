import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PLACE_CATEGORIES } from '@/types/place';
import type { PlaceFormData, FormErrors } from '@/types/place-form';

interface GeneralInfoSectionProps {
  formData: PlaceFormData;
  errors: FormErrors;
  onChange: (updates: Partial<PlaceFormData>) => void;
}

export function GeneralInfoSection({ formData, errors, onChange }: GeneralInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Place Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter place name..."
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onChange({ category: value })}
        >
          <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {PLACE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-sm font-medium">
          Image URL <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className={errors.imageUrl ? 'border-destructive' : ''}
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl}</p>
        )}
      </div>
    </div>
  );
}
