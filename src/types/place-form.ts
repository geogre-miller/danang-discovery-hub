export interface PlaceFormData {
  name: string;
  address: string;
  category: string;
  imageUrl: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formattedAddress?: string;
  openingHours?: {
    [key: string]: DayHours;
  };
}

export interface FormErrors {
  name?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
  coordinates?: string;
  openingHours?: {
    [key: string]: string;
  };
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export const DEFAULT_DAY_HOURS: DayHours = {
  open: "09:00",
  close: "18:00",
  closed: false,
};

export const DEFAULT_OPENING_HOURS = {
  monday: { ...DEFAULT_DAY_HOURS },
  tuesday: { ...DEFAULT_DAY_HOURS },
  wednesday: { ...DEFAULT_DAY_HOURS },
  thursday: { ...DEFAULT_DAY_HOURS },
  friday: { ...DEFAULT_DAY_HOURS },
  saturday: { ...DEFAULT_DAY_HOURS },
  sunday: { ...DEFAULT_DAY_HOURS, closed: true },
};
