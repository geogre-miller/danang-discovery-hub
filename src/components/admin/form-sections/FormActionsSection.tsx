import { Button } from '@/components/ui/button';

interface FormActionsSectionProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitText: string;
  isValid: boolean;
}

export function FormActionsSection({ 
  isSubmitting, 
  onCancel, 
  submitText, 
  isValid 
}: FormActionsSectionProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || !isValid}
        className="min-w-[100px]"
      >
        {isSubmitting ? 'Saving...' : submitText}
      </Button>
    </div>
  );
}
