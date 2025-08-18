import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlaceFormData, FormErrors, DayHours } from '@/types/place-form';

interface OpeningHoursSectionProps {
  formData: PlaceFormData;
  errors: FormErrors;
  onChange: (updates: Partial<PlaceFormData>) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export function OpeningHoursSection({ formData, errors, onChange }: OpeningHoursSectionProps) {
  const updateDayHours = (day: string, updates: Partial<DayHours>) => {
    const currentHours = formData.openingHours || {};
    const dayHours = currentHours[day] || {
      open: '09:00',
      close: '18:00',
      closed: false
    };

    onChange({
      openingHours: {
        ...currentHours,
        [day]: { ...dayHours, ...updates }
      }
    });
  };

  const copyToAllDays = (sourceDay: string) => {
    const currentHours = formData.openingHours || {};
    const sourceHours = currentHours[sourceDay];
    
    if (!sourceHours) return;

    const newHours = { ...currentHours };
    DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        newHours[key] = { ...sourceHours };
      }
    });

    onChange({ openingHours: newHours });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Opening Hours</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set the opening hours for each day of the week
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const dayHours = formData.openingHours?.[key] || {
            open: '09:00',
            close: '18:00',
            closed: false
          };
          
          const dayErrors = errors.openingHours?.[key] || {};
          const hasErrors = Object.keys(dayErrors).some(errorKey => 
            errorKey.startsWith(`${key}_`)
          );

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{label}</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToAllDays(key)}
                    className="text-xs text-primary hover:underline"
                    disabled={dayHours.closed}
                  >
                    Copy to all
                  </button>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${key}-closed`}
                      checked={dayHours.closed}
                      onCheckedChange={(checked) => 
                        updateDayHours(key, { closed: !!checked })
                      }
                    />
                    <Label htmlFor={`${key}-closed`} className="text-xs">
                      Closed
                    </Label>
                  </div>
                </div>
              </div>
              
              {!dayHours.closed && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`${key}-open`} className="text-xs text-muted-foreground">
                      Open
                    </Label>
                    <Input
                      id={`${key}-open`}
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => updateDayHours(key, { open: e.target.value })}
                      className={`text-xs ${
                        errors.openingHours?.[`${key}_open`] ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.openingHours?.[`${key}_open`] && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.openingHours[`${key}_open`]}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`${key}-close`} className="text-xs text-muted-foreground">
                      Close
                    </Label>
                    <Input
                      id={`${key}-close`}
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => updateDayHours(key, { close: e.target.value })}
                      className={`text-xs ${
                        errors.openingHours?.[`${key}_close`] ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.openingHours?.[`${key}_close`] && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.openingHours[`${key}_close`]}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {errors.openingHours?.[`${key}_time`] && (
                <p className="text-xs text-destructive">
                  {errors.openingHours[`${key}_time`]}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
