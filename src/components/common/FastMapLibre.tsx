import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Loader2, Layers, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Place } from '@/types/place';
import { geoapifyService, type PlaceAutocompleteResult } from '@/services/geoapify.service';
import { categoryService, Category } from '@/services/category-api.service';
import { getCategoryColor } from '@/lib/category-markers';

// Configuration - Use environment variables
const CONFIG = {
    MAPTILER_KEY: import.meta.env.VITE_MAPTILER_KEY || '',
    GEOAPIFY_KEY: import.meta.env.VITE_GEOAPIFY_KEY || '',
    DA_NANG_CENTER: [108.206230, 16.047079] as [number, number],
    DEFAULT_ZOOM: 12,
    SEARCH_DEBOUNCE: 400,
    CACHE_TTL: 10 * 60 * 1000,
    MAX_SEARCH_RESULTS: 5
};

interface RouteResult {
    geometry: any;
    distance: number;
    duration: number;
}

// Cache utility
class CacheManager {
    private cache = new Map<string, { data: any; timestamp: number }>();

    set<T>(key: string, data: T): void {
        this.cache.set(key, { data, timestamp: Date.now() });
        try {
            sessionStorage.setItem(`map_cache_${key}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (e) {
            // Silent fail
        }
    }

    get<T>(key: string): T | null {
        const memoryEntry = this.cache.get(key);
        if (memoryEntry && this.isValid(memoryEntry)) {
            return memoryEntry.data;
        }

        try {
            const stored = sessionStorage.getItem(`map_cache_${key}`);
            if (stored) {
                const entry = JSON.parse(stored);
                if (this.isValid(entry)) {
                    this.cache.set(key, entry);
                    return entry.data;
                }
            }
        } catch (e) {
            // Silent fail
        }

        return null;
    }

    private isValid(entry: { timestamp: number }): boolean {
        return Date.now() - entry.timestamp < CONFIG.CACHE_TTL;
    }
}

// Utility functions
const Utils = {
    debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
        let timeout: number;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = window.setTimeout(() => func(...args), wait);
        };
    },

    formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    },

    formatDuration(seconds: number): string {
        const minutes = Math.round(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes} min`;
    },

    isValidCoordinate(lng: number, lat: number): boolean {
        return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    },

    escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

interface FastMapLibreProps {
    center?: [number, number];
    zoom?: number;
    height?: string;
    className?: string;
    places?: Place[];
    selectedPlace?: Place | null;
    onLocationSelect?: (result: PlaceAutocompleteResult) => void;
    onPlaceClick?: (place: Place) => void;
    showSearch?: boolean;
    showControls?: boolean;
    showPlaceMarkers?: boolean;
    interactive?: boolean;
}

const FastMapLibre: React.FC<FastMapLibreProps> = ({
    center = CONFIG.DA_NANG_CENTER,
    zoom = CONFIG.DEFAULT_ZOOM,
    height = '600px',
    className = '',
    places = [],
    selectedPlace = null,
    onLocationSelect,
    onPlaceClick,
    showSearch = true,
    showControls = true,
    showPlaceMarkers = true,
    interactive = true
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const cache = useRef(new CacheManager());
    const abortController = useRef<AbortController | null>(null);
    const placeMarkers = useRef<Map<string, maplibregl.Marker>>(new Map());
    const searchMarker = useRef<maplibregl.Marker | null>(null);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('streets-v2');
    // ROUTING STATE - COMMENTED OUT
    // const [isRoutingMode, setIsRoutingMode] = useState(false);
    // const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
    // const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    // const [routeMarkers, setRouteMarkers] = useState<maplibregl.Marker[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showLayerControl, setShowLayerControl] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        if (!CONFIG.MAPTILER_KEY || !CONFIG.GEOAPIFY_KEY) {
            toast.error('Please configure MapTiler and Geoapify API keys in environment variables');
            return;
        }

        const styleUrl = `https://api.maptiler.com/maps/${selectedStyle}/style.json?key=${CONFIG.MAPTILER_KEY}`;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl,
            center: center,
            zoom: zoom,
            interactive: interactive,
            transformRequest: (url: string) => {
                if (url.includes('api.maptiler.com')) {
                    const separator = url.includes('?') ? '&' : '?';
                    return {
                        url: `${url}${separator}key=${CONFIG.MAPTILER_KEY}`
                    };
                }
                return { url };
            }
        });

        if (interactive && showControls) {
            // Add controls
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
            map.current.addControl(new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }), 'top-right');
        }

        // Click handler for reverse geocoding and routing
        if (interactive) {
            map.current.on('click', handleMapClick);
        }

        // Load categories
        loadCategories();

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [center, zoom, interactive, showControls]);

    // Load categories
    const loadCategories = async () => {
        try {
            const cats = await categoryService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    // Update place markers when places change
    useEffect(() => {
        if (!map.current || !showPlaceMarkers) return;

        // Clear existing place markers
        placeMarkers.current.forEach(marker => marker.remove());
        placeMarkers.current.clear();

        // Add place markers
        places.forEach(place => {
            if (place.coordinates) {
                // Use enhanced category color logic
                const categoryColor = getCategoryColor(place.category);
                
                const marker = new maplibregl.Marker({ 
                    color: categoryColor,
                    scale: 1.0
                })
                    .setLngLat([place.coordinates.lng, place.coordinates.lat])
                    .addTo(map.current!);

                // Add popup
                const popupContent = `
                    <div style="padding: 12px; max-width: 250px;">
                        <div style="font-weight: bold; margin-bottom: 8px; color: #1e293b;">${Utils.escapeHtml(place.name)}</div>
                        <div style="color: #64748b; font-size: 13px; margin-bottom: 8px;">${Utils.escapeHtml(place.address)}</div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">
                            📅 ${place.time} | 👍 ${place.likes} | 👎 ${place.dislikes}
                        </div>
                        ${place.imageUrl ? `<img src="${place.imageUrl}" alt="${place.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-top: 8px;">` : ''}
                    </div>
                `;

                const popup = new maplibregl.Popup({ 
                    offset: 25,
                    closeButton: true,
                    closeOnClick: false
                }).setHTML(popupContent);

                marker.setPopup(popup);

                // Add click handler
                if (onPlaceClick) {
                    marker.getElement().addEventListener('click', () => {
                        onPlaceClick(place);
                    });
                    marker.getElement().style.cursor = 'pointer';
                }

                placeMarkers.current.set(place._id, marker);
            }
        });
    }, [places, categories, showPlaceMarkers, onPlaceClick]);

    // Highlight selected place
    useEffect(() => {
        if (!map.current || !selectedPlace) return;

        // Reset all markers to normal scale
        placeMarkers.current.forEach(marker => {
            marker.getElement().style.transform = 'scale(1.0)';
            marker.getElement().style.zIndex = '0';
        });

        // Highlight selected place marker
        const selectedMarker = placeMarkers.current.get(selectedPlace._id);
        if (selectedMarker) {
            selectedMarker.getElement().style.transform = 'scale(1.4)';
            selectedMarker.getElement().style.zIndex = '1000';
            
            // Open popup if it has one
            const popup = selectedMarker.getPopup();
            if (popup) {
                popup.addTo(map.current);
            }

            // Fly to selected place
            if (selectedPlace.coordinates) {
                map.current.flyTo({
                    center: [selectedPlace.coordinates.lng, selectedPlace.coordinates.lat],
                    zoom: Math.max(map.current.getZoom(), 15),
                    duration: 1000
                });
            }
        }
    }, [selectedPlace]);

    // Update map style
    useEffect(() => {
        if (map.current) {
            const styleUrl = `https://api.maptiler.com/maps/${selectedStyle}/style.json?key=${CONFIG.MAPTILER_KEY}`;
            map.current.setStyle(styleUrl);
        }
    }, [selectedStyle]);

    // Search functionality using geoapifyService
    const searchPlaces = async (query: string): Promise<PlaceAutocompleteResult[]> => {
        const cacheKey = `search_${query.toLowerCase()}`;
        const cached = cache.current.get<PlaceAutocompleteResult[]>(cacheKey);
        if (cached) return cached;

        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        try {
            const results = await geoapifyService.autocomplete(query, {
                limit: CONFIG.MAX_SEARCH_RESULTS,
                bias: 'countrycode:vn'
            });

            cache.current.set(cacheKey, results);
            return results;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return [];
            }
            throw error;
        }
    };

    // Debounced search
    const debouncedSearch = Utils.debounce(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchPlaces(query);
            setSearchResults(results);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    }, CONFIG.SEARCH_DEBOUNCE);

    // Handle search input
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // Select search result
    const selectResult = (result: PlaceAutocompleteResult) => {
        setSearchQuery(result.name);
        setShowResults(false);
        
        if (map.current) {
            map.current.flyTo({
                center: result.coordinates,
                zoom: 16,
                duration: 1000
            });

            // Remove existing search marker
            if (searchMarker.current) {
                searchMarker.current.remove();
            }

            // Add new search marker
            const marker = new maplibregl.Marker({ color: '#3b82f6' })
                .setLngLat(result.coordinates)
                .addTo(map.current);

            const popup = new maplibregl.Popup({ offset: 25 })
                .setHTML(`
                    <div style="padding: 8px;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${Utils.escapeHtml(result.name)}</div>
                        <div style="color: #666; font-size: 13px;">${Utils.escapeHtml(result.address)}</div>
                    </div>
                `);
            marker.setPopup(popup);
            popup.addTo(map.current);

            searchMarker.current = marker;
        }

        onLocationSelect?.(result);
    };

    // Handle map clicks
    const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
        const { lng, lat } = e.lngLat;

        // ROUTING FUNCTIONALITY - COMMENTED OUT
        /*
        if (isRoutingMode) {
            // Handle routing
            const newCoordinates = [...routeCoordinates, [lng, lat] as [number, number]];
            setRouteCoordinates(newCoordinates);

            // Add route marker
            const markerColor = newCoordinates.length === 1 ? '#22c55e' : '#ef4444';
            const marker = new maplibregl.Marker({ color: markerColor })
                .setLngLat([lng, lat])
                .addTo(map.current!);

            setRouteMarkers(prev => [...prev, marker]);

            // ROUTING FUNCTIONALITY - COMMENTED OUT
            if (newCoordinates.length === 2) {
                await calculateRoute(newCoordinates);
                setIsRoutingMode(false);
            }
        } else {
        */
        
        // Reverse geocoding
            try {
                const result = await geoapifyService.reverseGeocode(lat, lng);
                if (result && map.current) {
                    const popup = new maplibregl.Popup()
                        .setLngLat([lng, lat])
                        .setHTML(`
                            <div style="padding: 8px; max-width: 200px;">
                                <div style="font-weight: bold; margin-bottom: 4px;">📍 Location</div>
                                <div style="font-size: 13px; color: #666;">${Utils.escapeHtml(result.formattedAddress)}</div>
                                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                                    ${lat.toFixed(6)}, ${lng.toFixed(6)}
                                </div>
                            </div>
                        `)
                        .addTo(map.current);
                }
            } catch (error) {
                console.error('Reverse geocoding error:', error);
            }
        // } // Closing for commented routing condition
    };

    // ROUTING FUNCTIONALITY - COMMENTED OUT FOR FUTURE USE
    /*
    // Calculate route
    const calculateRoute = async (coordinates: [number, number][]) => {
        if (coordinates.length !== 2) return;

        const [start, end] = coordinates;
        const cacheKey = `route_${start[0].toFixed(6)}_${start[1].toFixed(6)}_${end[0].toFixed(6)}_${end[1].toFixed(6)}`;
        const cached = cache.current.get<RouteResult>(cacheKey);

        if (cached) {
            displayRoute(cached);
            return;
        }

        try {
            const waypoints = `${start[1]},${start[0]}|${end[1]},${end[0]}`;
            const params = new URLSearchParams({
                waypoints,
                mode: 'drive',
                apiKey: CONFIG.GEOAPIFY_KEY,
                format: 'geojson'
            });

            const response = await fetch(
                `https://api.geoapify.com/v1/routing?${params}`
            );

            if (!response.ok) {
                throw new Error(`Routing failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.features?.length > 0) {
                const route = data.features[0];
                const routeResult: RouteResult = {
                    geometry: route.geometry,
                    distance: route.properties?.distance || 0,
                    duration: route.properties?.time || 0
                };

                cache.current.set(cacheKey, routeResult);
                displayRoute(routeResult);
            }
        } catch (error) {
            console.error('Routing error:', error);
            toast.error('Failed to calculate route');
        }
    };

    // Display route
    const displayRoute = (route: RouteResult) => {
        if (!map.current) return;

        // Remove existing route
        if (map.current.getLayer('route')) {
            map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
            map.current.removeSource('route');
        }

        // Add route
        map.current.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
            }
        });

        map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8
            }
        });

        setRouteInfo(route);

        // Fit bounds
        if (route.geometry.coordinates?.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            route.geometry.coordinates.forEach((coord: [number, number]) => {
                bounds.extend(coord);
            });
            map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
    };

    // Clear route
    const clearRoute = () => {
        setRouteCoordinates([]);
        setRouteInfo(null);
        setIsRoutingMode(false);
        
        // Clear markers
        routeMarkers.forEach(marker => marker.remove());
        setRouteMarkers([]);

        // Remove route layer
        if (map.current) {
            if (map.current.getLayer('route')) {
                map.current.removeLayer('route');
            }
            if (map.current.getSource('route')) {
                map.current.removeSource('route');
            }
        }
    };
    */

    return (
        <div className={`relative ${className}`} style={{ height }}>
            {/* Search Box */}
            {showSearch && (
                <div className="absolute top-4 left-4 z-10 w-80">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search places in Da Nang..."
                            className="bg-white shadow-lg pl-10"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                        )}
                    </div>
                    {showResults && searchResults.length > 0 && (
                        <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto shadow-lg">
                            <CardContent className="p-0">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        onClick={() => selectResult(result)}
                                    >
                                        <div className="font-medium">{result.name}</div>
                                        <div className="text-sm text-gray-600">{result.address}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Controls */}
            {showControls && (
                <div className="absolute top-3 right-4 z-10 flex flex-col gap-2 mr-10">
                    {/* ROUTING BUTTON - COMMENTED OUT
                    <Button
                        variant={isRoutingMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsRoutingMode(!isRoutingMode)}
                        className="bg-white shadow-lg"
                    >
                        <Route className="h-4 w-4" />
                    </Button>
                    */}

                    {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLayerControl(!showLayerControl)}
                        className="bg-white shadow-lg"
                    >
                        <Layers className="h-4 w-4" />
                    </Button> */}

                    <Select value={selectedStyle} onValueChange={setSelectedStyle} >
                        <SelectTrigger className="w-32 bg-white shadow-lg ">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="streets-v2">Streets</SelectItem>
                            <SelectItem value="satellite">Satellite</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="topo-v2">Topographic</SelectItem>
                            <SelectItem value="winter-v2">Winter</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Layer Control */}
            {showLayerControl && categories.length > 0 && (
                <Card className="absolute top-4 right-48 z-10 w-48 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category._id} className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: getCategoryColor(category.name) }}
                                    ></div>
                                    <span className="text-sm">{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Route Info */}
            {/* ROUTING INFO CARD - COMMENTED OUT
            {routeInfo && (
                <Card className="absolute bottom-4 left-4 z-10 w-64 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Route Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-sm space-y-1">
                            <div>Distance: {Utils.formatDistance(routeInfo.distance)}</div>
                            <div>Duration: {Utils.formatDuration(routeInfo.duration)}</div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearRoute}
                            className="mt-3 w-full"
                        >
                            Clear Route
                        </Button>
                    </CardContent>
                </Card>
            )}
            */}

            {/* Map Container */}
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if key props change (not the place data like likes/dislikes)
const MemoizedFastMapLibre = React.memo(FastMapLibre, (prevProps, nextProps) => {
    // Helper function to safely compare coordinates
    const coordsEqual = (coord1?: [number, number], coord2?: [number, number]) => {
        if (!coord1 && !coord2) return true;
        if (!coord1 || !coord2) return false;
        return Math.abs(coord1[0] - coord2[0]) < 0.000001 && Math.abs(coord1[1] - coord2[1]) < 0.000001;
    };

    const placeCoordEqual = (place1?: { coordinates?: { lat: number; lng: number } }, place2?: { coordinates?: { lat: number; lng: number } }) => {
        if (!place1?.coordinates && !place2?.coordinates) return true;
        if (!place1?.coordinates || !place2?.coordinates) return false;
        return Math.abs(place1.coordinates.lat - place2.coordinates.lat) < 0.000001 && 
               Math.abs(place1.coordinates.lng - place2.coordinates.lng) < 0.000001;
    };

    // Only re-render if these specific props change
    return (
        coordsEqual(prevProps.center, nextProps.center) &&
        prevProps.zoom === nextProps.zoom &&
        prevProps.height === nextProps.height &&
        prevProps.className === nextProps.className &&
        prevProps.showSearch === nextProps.showSearch &&
        prevProps.showControls === nextProps.showControls &&
        prevProps.showPlaceMarkers === nextProps.showPlaceMarkers &&
        prevProps.interactive === nextProps.interactive &&
        // Only check place ID and coordinates, not mutable data like likes
        prevProps.places?.length === nextProps.places?.length &&
        prevProps.places?.every((place, index) => {
            const nextPlace = nextProps.places?.[index];
            return place._id === nextPlace?._id && placeCoordEqual(place, nextPlace);
        }) &&
        prevProps.selectedPlace?._id === nextProps.selectedPlace?._id &&
        placeCoordEqual(prevProps.selectedPlace, nextProps.selectedPlace)
    );
});

MemoizedFastMapLibre.displayName = 'FastMapLibre';

export default MemoizedFastMapLibre;
