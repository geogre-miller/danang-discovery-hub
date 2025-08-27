import type { DayHours } from '@/types/place';

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
export const WEEKEND = ['saturday', 'sunday'];

/**
 * Formats time from 24h format to 12h format
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Formats opening hours for a single day
 */
export function formatDayHours(dayHours: DayHours | undefined): string {
  if (!dayHours || dayHours.closed) return 'Closed';
  if (dayHours.open === '00:00' && dayHours.close === '23:59') return '24/7';
  return `${formatTime(dayHours.open)}–${formatTime(dayHours.close)}`;
}

/**
 * Gets the current day of week key
 */
export function getCurrentDayKey(): string {
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayKeys[dayIndex];
}

/**
 * Checks if a place is currently open
 */
export function isPlaceOpen(openingHours: { [key: string]: DayHours } | undefined): boolean {
  if (!openingHours) return false;
  
  const currentDay = getCurrentDayKey();
  const todayHours = openingHours[currentDay];
  
  if (!todayHours || todayHours.closed) return false;
  if (todayHours.open === '00:00' && todayHours.close === '23:59') return true;
  
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

/**
 * Gets today's hours for a place with days pattern
 */
export function getTodayHours(openingHours: { [key: string]: DayHours } | undefined): string {
  if (!openingHours) return 'Hours not available';
  
  const currentDay = getCurrentDayKey();
  const todayHours = openingHours[currentDay];
  const dayLabel = DAYS_OF_WEEK.find(day => day.key === currentDay)?.label || 'Today';
  
  const hoursStr = formatDayHours(todayHours);
  const daysPattern = getDaysPattern(openingHours);
  
  return `${dayLabel}: ${hoursStr}${daysPattern ? ` • ${daysPattern}` : ''}`;
}

/**
 * Gets compact hours display for place cards
 */
export function getCompactHours(openingHours: { [key: string]: DayHours } | undefined): string {
  if (!openingHours) return '';
  
  const currentDay = getCurrentDayKey();
  const todayHours = openingHours[currentDay];
  const hoursStr = formatDayHours(todayHours);
  const daysPattern = getDaysPattern(openingHours);
  
  return daysPattern ? `${hoursStr} • ${daysPattern}` : hoursStr;
}

/**
 * Gets a pattern of days the place is open
 */
export function getDaysPattern(openingHours: { [key: string]: DayHours } | undefined): string {
  if (!openingHours) return '';
  
  const openDays = DAYS_OF_WEEK.filter(({ key }) => {
    const dayHours = openingHours[key];
    return dayHours && !dayHours.closed;
  });

  const closedDays = DAYS_OF_WEEK.filter(({ key }) => {
    const dayHours = openingHours[key];
    return !dayHours || dayHours.closed;
  });

  if (openDays.length === 0) return 'Closed all days';
  if (openDays.length === 7) return 'Open daily';
  
  // Check for common patterns
  const weekdaysOpen = WEEKDAYS.every(day => {
    const dayHours = openingHours[day];
    return dayHours && !dayHours.closed;
  });
  
  const weekendOpen = WEEKEND.every(day => {
    const dayHours = openingHours[day];
    return dayHours && !dayHours.closed;
  });
  
  const weekendClosed = WEEKEND.every(day => {
    const dayHours = openingHours[day];
    return !dayHours || dayHours.closed;
  });

  if (weekdaysOpen && weekendClosed) {
    return 'Monday - Friday';
  }
  
  if (weekdaysOpen && weekendOpen) {
    return 'Monday - Sunday';
  }
  
  if (weekdaysOpen && openDays.some(d => d.key === 'saturday') && closedDays.some(d => d.key === 'sunday')) {
    return 'Monday - Saturday';
  }

  // Handle consecutive days
  if (openDays.length >= 3) {
    const consecutiveRanges = getConsecutiveRanges(openDays.map(d => d.key));
    if (consecutiveRanges.length === 1) {
      const range = consecutiveRanges[0];
      const startDay = DAYS_OF_WEEK.find(d => d.key === range[0])?.label;
      const endDay = DAYS_OF_WEEK.find(d => d.key === range[range.length - 1])?.label;
      
      let pattern = `${startDay} - ${endDay}`;
      
      // Add closed days info if there are any
      if (closedDays.length > 0 && closedDays.length <= 2) {
        const closedDayNames = closedDays.map(d => d.label).join(' & ');
        pattern += `, Closed on ${closedDayNames}`;
      }
      
      return pattern;
    }
  }
  
  // Fallback: list individual days or ranges
  if (openDays.length <= 3) {
    return openDays.map(d => d.label).join(', ');
  }
  
  // If more complex pattern, show closed days if fewer
  if (closedDays.length <= 2 && closedDays.length > 0) {
    const closedDayNames = closedDays.map(d => d.label).join(' & ');
    return `Closed on ${closedDayNames}`;
  }
  
  return `Open ${openDays.length} days`;
}

/**
 * Helper function to find consecutive day ranges
 */
function getConsecutiveRanges(dayKeys: string[]): string[][] {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const sortedDays = dayKeys.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  
  const ranges: string[][] = [];
  let currentRange: string[] = [];
  
  for (let i = 0; i < sortedDays.length; i++) {
    const currentDayIndex = dayOrder.indexOf(sortedDays[i]);
    const prevDayIndex = i > 0 ? dayOrder.indexOf(sortedDays[i - 1]) : -1;
    
    if (i === 0 || currentDayIndex === prevDayIndex + 1) {
      currentRange.push(sortedDays[i]);
    } else {
      if (currentRange.length > 0) {
        ranges.push(currentRange);
      }
      currentRange = [sortedDays[i]];
    }
  }
  
  if (currentRange.length > 0) {
    ranges.push(currentRange);
  }
  
  return ranges;
}

/**
 * Creates a compact summary of opening hours
 */
export function getHoursSummary(openingHours: { [key: string]: DayHours } | undefined): string {
  if (!openingHours) return 'Hours not set';
  
  // Check if all days are the same
  const firstDay = openingHours[DAYS_OF_WEEK[0].key];
  const allSame = DAYS_OF_WEEK.every(({ key }) => {
    const dayHours = openingHours[key];
    if (!firstDay && !dayHours) return true;
    if (!firstDay || !dayHours) return false;
    return firstDay.open === dayHours.open && 
           firstDay.close === dayHours.close && 
           firstDay.closed === dayHours.closed;
  });

  if (allSame && firstDay) {
    if (firstDay.closed) return 'Closed all days';
    if (firstDay.open === '00:00' && firstDay.close === '23:59') return 'Open 24/7';
    return `Daily: ${formatTime(firstDay.open)}–${formatTime(firstDay.close)}`;
  }

  // Check weekday/weekend pattern
  const weekdayHours = openingHours[WEEKDAYS[0]];
  const weekdaysSame = weekdayHours && WEEKDAYS.every(day => {
    const dayHours = openingHours[day];
    return dayHours && 
           weekdayHours.open === dayHours.open && 
           weekdayHours.close === dayHours.close && 
           weekdayHours.closed === dayHours.closed;
  });

  const weekendHours = openingHours[WEEKEND[0]];
  const weekendSame = weekendHours && WEEKEND.every(day => {
    const dayHours = openingHours[day];
    return dayHours && 
           weekendHours.open === dayHours.open && 
           weekendHours.close === dayHours.close && 
           weekendHours.closed === dayHours.closed;
  });

  if (weekdaysSame && weekendSame && weekdayHours && weekendHours) {
    const weekdayStr = weekdayHours.closed ? 'Closed' : `${formatTime(weekdayHours.open)}–${formatTime(weekdayHours.close)}`;
    const weekendStr = weekendHours.closed ? 'Closed' : `${formatTime(weekendHours.open)}–${formatTime(weekendHours.close)}`;
    return `Mon–Fri: ${weekdayStr}, Sat–Sun: ${weekendStr}`;
  }

  // Fallback: show today's hours
  return getTodayHours(openingHours);
}

/**
 * Creates a full weekly schedule display
 */
export function getWeeklySchedule(openingHours: { [key: string]: DayHours } | undefined): Array<{ day: string; hours: string; isToday: boolean }> {
  if (!openingHours) return [];
  
  const currentDay = getCurrentDayKey();
  
  return DAYS_OF_WEEK.map(({ key, label }) => ({
    day: label,
    hours: formatDayHours(openingHours[key]),
    isToday: key === currentDay
  }));
}
