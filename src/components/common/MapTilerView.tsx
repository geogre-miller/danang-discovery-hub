import React, { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import { categoryService, Category } from '../../services/category-api.service';
import { MapPin } from 'lucide-react';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_KEY;

export interface MapTilerMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  info?: string;
  category?: string;
}

interface MapTilerViewProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  width?: string;
  height?: string;
  markers?: MapTilerMarker[];
  onMarkerClick?: (marker: MapTilerMarker) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function MapTilerView({
  center,
  zoom = 15,
  width = '100%',
  height = '400px',
  markers = [],
  onMarkerClick,
  className = '',
  style
}: MapTilerViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<maptilersdk.Marker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Set API key
  maptilersdk.config.apiKey = MAPTILER_API_KEY;

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategoriesLoaded(true); // Still allow map to render with defaults
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!MAPTILER_API_KEY) return;

    if (map.current) return; // stops map from initializing more than once

    map.current = new maptilersdk.Map({
      container: mapContainer.current!,
      style: maptilersdk.MapStyle.STREETS,
      center: [center.lng, center.lat],
      zoom: zoom
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center.lat, center.lng, zoom]);

  // Update markers when they change
  useEffect(() => {
    if (!map.current || !categoriesLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers using simple MapTiler markers
    markers.forEach(markerData => {
      const categoryColor = categoryService.getCategoryColor(markerData.category, categories);

      // Create simple marker with color - this will be stable and not drift
      const marker = new maptilersdk.Marker({ 
        color: categoryColor,
        scale: 1.2 
      })
        .setLngLat([markerData.position.lng, markerData.position.lat])
        .addTo(map.current!);

      // Add click event if callback provided
      if (onMarkerClick) {
        marker.getElement().addEventListener('click', () => onMarkerClick(markerData));
        marker.getElement().style.cursor = 'pointer';
        marker.getElement().title = markerData.title;
      }

      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick, categories, categoriesLoaded]);

  // Update map center when center changes
  useEffect(() => {
    if (map.current) {
      map.current.setCenter([center.lng, center.lat]);
    }
  }, [center.lat, center.lng]);

  if (!MAPTILER_API_KEY) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-center p-4">
          <MapPin className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">MapTiler API key not configured</p>
          <p className="text-xs text-gray-400 mt-1">Please set VITE_MAPTILER_KEY in your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height, ...style }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// Helper component for simple single-point maps
export function SimpleMapTilerView({ 
  center, 
  title, 
  category,
  zoom = 16,
  height = '300px',
  className = ''
}: {
  center: { lat: number; lng: number };
  title: string;
  category?: string;
  zoom?: number;
  height?: string;
  className?: string;
}) {
  const marker: MapTilerMarker = {
    id: 'single-marker',
    position: center,
    title: title,
    category: category
  };

  return (
    <MapTilerView
      center={center}
      zoom={zoom}
      height={height}
      markers={[marker]}
      className={className}
    />
  );
}
