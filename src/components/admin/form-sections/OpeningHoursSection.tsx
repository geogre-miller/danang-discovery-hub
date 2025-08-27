import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Copy, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlaceFormData, FormErrors, DayHours } from '@/types/place-form';

interface OpeningHoursSectionProps {
  formData: PlaceFormData;
  errors: FormErrors;
  onChange: (updates: Partial<PlaceFormData>) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const WEEKEND = ['saturday', 'sunday'];

const PRESETS = [
  { label: '9:00–18:00 (All days)', open: '09:00', close: '18:00', closed: false },
  { label: '8:00–22:00 (All days)', open: '08:00', close: '22:00', closed: false },
  { label: '24/7 (Always open)', open: '00:00', close: '23:59', closed: false },
];

type PresetType = {
  label: string;
  open: string;
  close: string;
  closed: boolean;
};

export function OpeningHoursSection({ formData, errors, onChange }: OpeningHoursSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const applyToMultipleDays = (days: string[], sourceDay?: string) => {
    const currentHours = formData.openingHours || {};
    const sourceHours = sourceDay ? currentHours[sourceDay] : { open: '09:00', close: '18:00', closed: false };
    
    if (!sourceHours) return;

    const newHours = { ...currentHours };
    days.forEach((day) => {
      newHours[day] = { ...sourceHours };
    });

    onChange({ openingHours: newHours });
  };

  const applyPreset = (preset: PresetType) => {
    const newHours: { [key: string]: DayHours } = {};
    DAYS.forEach(({ key }) => {
      newHours[key] = {
        open: preset.open,
        close: preset.close,
        closed: preset.closed
      };
    });
    onChange({ openingHours: newHours });
  };

  const formatHoursForDay = (day: string): string => {
    const dayHours = formData.openingHours?.[day];
    if (!dayHours || dayHours.closed) return 'Closed';
    return `${dayHours.open}–${dayHours.close}`;
  };

  const getHoursSummary = (): string => {
    const hours = formData.openingHours || {};
    
    // Check if all days are the same
    const firstDay = hours[DAYS[0].key];
    const allSame = DAYS.every(({ key }) => {
      const dayHours = hours[key];
      if (!firstDay && !dayHours) return true;
      if (!firstDay || !dayHours) return false;
      return firstDay.open === dayHours.open && 
             firstDay.close === dayHours.close && 
             firstDay.closed === dayHours.closed;
    });

    if (allSame && firstDay) {
      if (firstDay.closed) return 'Closed all days';
      if (firstDay.open === '00:00' && firstDay.close === '23:59') return '24/7';
      return `All days: ${firstDay.open}–${firstDay.close}`;
    }

    // Check weekday/weekend pattern
    const weekdayHours = hours[WEEKDAYS[0]];
    const weekdaysSame = weekdayHours && WEEKDAYS.every(day => {
      const dayHours = hours[day];
      return dayHours && 
             weekdayHours.open === dayHours.open && 
             weekdayHours.close === dayHours.close && 
             weekdayHours.closed === dayHours.closed;
    });

    const weekendHours = hours[WEEKEND[0]];
    const weekendSame = weekendHours && WEEKEND.every(day => {
      const dayHours = hours[day];
      return dayHours && 
             weekendHours.open === dayHours.open && 
             weekendHours.close === dayHours.close && 
             weekendHours.closed === dayHours.closed;
    });

    if (weekdaysSame && weekendSame && weekdayHours && weekendHours) {
      const weekdayStr = weekdayHours.closed ? 'Closed' : `${weekdayHours.open}–${weekdayHours.close}`;
      const weekendStr = weekendHours.closed ? 'Closed' : `${weekendHours.open}–${weekendHours.close}`;
      return `Mon–Fri: ${weekdayStr}, Sat–Sun: ${weekendStr}`;
    }

    // Fallback: show individual days
    const openDays = DAYS.filter(({ key }) => hours[key] && !hours[key].closed);
    if (openDays.length === 0) return 'Closed all days';
    if (openDays.length <= 3) {
      return openDays.map(({ short, key }) => `${short}: ${formatHoursForDay(key)}`).join(', ');
    }
    return `${openDays.length} days open`;
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer group">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Opening Hours
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {getHoursSummary()}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground",
                isExpanded && "rotate-180"
              )} />
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Actions</Label>
              
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Apply to groups */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyToMultipleDays(WEEKDAYS, 'monday')}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Apply to Weekdays
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyToMultipleDays(WEEKEND, 'saturday')}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Apply to Weekend
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyToMultipleDays(DAYS.map(d => d.key), 'monday')}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Apply to All Days
                </Button>
              </div>
            </div>

            {/* Individual Day Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Individual Days</Label>
              
              {DAYS.map(({ key, label, short }) => {
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
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <span className="w-8 text-xs text-muted-foreground">{short}</span>
                        {label}
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          onClick={() => applyToMultipleDays(DAYS.map(d => d.key), key)}
                          variant="ghost"
                          size="sm"
                          disabled={dayHours.closed}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy to all
                        </Button>
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
                      <div className="grid grid-cols-2 gap-3 ml-10">
                        <div>
                          <Label htmlFor={`${key}-open`} className="text-xs text-muted-foreground">
                            Open
                          </Label>
                          <Input
                            id={`${key}-open`}
                            type="time"
                            value={dayHours.open}
                            onChange={(e) => updateDayHours(key, { open: e.target.value })}
                            className={cn(
                              "text-xs",
                              errors.openingHours?.[`${key}_open`] && 'border-destructive'
                            )}
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
                            className={cn(
                              "text-xs",
                              errors.openingHours?.[`${key}_close`] && 'border-destructive'
                            )}
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
                      <p className="text-xs text-destructive ml-10">
                        {errors.openingHours[`${key}_time`]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
