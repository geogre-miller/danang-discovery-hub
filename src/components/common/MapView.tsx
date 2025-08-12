// @ts-nocheck
import { MapContainer as RLMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MapViewProps = {
  center: LatLngExpression;
  zoom?: number;
  label?: string;
  className?: string;
};

export default function MapView({ center, zoom = 14, label, className }: MapViewProps) {
  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <RLMapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </RLMapContainer>
    </div>
  );
}
