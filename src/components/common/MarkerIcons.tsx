import L from 'leaflet';

// Default Leaflet marker
export const defaultMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34], 
  shadowSize: [41, 41]
});

// Red pin marker
export const redPinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.163 24.837 0 16 0ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z" fill="#ef4444"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
});

// Blue pin marker
export const bluePinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.163 24.837 0 16 0ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z" fill="#3b82f6"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
});

// Green pin marker
export const greenPinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.163 24.837 0 16 0ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z" fill="#10b981"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
});

// Coffee cup marker for cafes
export const coffeeCupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#8b4513" stroke="white" stroke-width="2"/>
      <svg x="8" y="8" width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M18.5 3H6c-.83 0-1.5.67-1.5 1.5v9c0 3.31 2.69 6 6 6h3c3.31 0 6-2.69 6-6v-2h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 6 18.5 6H18V4.5c0-.83-.67-1.5-1.5-1.5zM16 13.5c0 1.93-1.57 3.5-3.5 3.5h-3C7.57 17 6 15.43 6 13.5v-7h10v7zm2-5.5h.5c.28 0 .5.22.5.5s-.22.5-.5.5H18V8z"/>
      </svg>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Restaurant marker
export const restaurantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#f59e0b" stroke="white" stroke-width="2"/>
      <svg x="8" y="8" width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
      </svg>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Create category-based marker function
export const getCategoryMarkerIcon = (category: string): L.Icon => {
  if (!category) return redPinIcon;
  
  const normalizedCategory = category.toLowerCase().trim();
  
  switch (normalizedCategory) {
    case 'coffee shop':
    case 'cafe':
    case 'cafe & food':
    case 'cafe take away':
    case 'bakery':
      return coffeeCupIcon;
    case 'restaurant':
    case 'fast food':
    case 'dessert':
      return restaurantIcon;
    case 'bar':
      return bluePinIcon;
    case 'other':
    default:
      return redPinIcon;
  }
};
