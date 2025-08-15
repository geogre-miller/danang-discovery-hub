// @ts-nocheck
import { MapContainer as RLMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategoryMarkerIcon, redPinIcon } from './MarkerIcons';

type MapViewProps = {
  center: LatLngExpression;
  zoom?: number;
  label?: string;
  className?: string;
  category?: string; // Add category prop for marker customization
  customIcon?: L.Icon; // Allow custom icon override
};

export default function MapView({ 
  center, 
  zoom = 14, 
  label, 
  className, 
  category,
  customIcon 
}: MapViewProps) {
  // Validate center coordinates to prevent null/undefined errors
  const isValidCoordinates = (coords: any): coords is LatLngExpression => {
    if (Array.isArray(coords)) {
      return coords.length === 2 && 
             typeof coords[0] === 'number' && 
             typeof coords[1] === 'number' && 
             !isNaN(coords[0]) && 
             !isNaN(coords[1]);
    }
    return false;
  };

  // Default to Da Nang city center if invalid coordinates
  const safeCenter: LatLngExpression = isValidCoordinates(center) ? center : [16.0544, 108.2022];
  
  // Choose marker icon based on priority: customIcon > category > default
  const markerIcon = customIcon || (category ? getCategoryMarkerIcon(category) : redPinIcon);

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <RLMapContainer center={safeCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={safeCenter} icon={markerIcon}>
          {label && (
            <Popup>
              <div className="text-center">
                <div className="font-semibold">{label}</div>
                {category && (
                  <div className="text-sm text-muted-foreground mt-1">{category}</div>
                )}
              </div>
            </Popup>
          )}
        </Marker>
      </RLMapContainer>
    </div>
  );
}
