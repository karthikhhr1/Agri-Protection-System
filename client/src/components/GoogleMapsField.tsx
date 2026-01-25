/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { Loader2, MapPin } from "lucide-react";

interface PolygonPoint {
  lat: number;
  lng: number;
}

interface GoogleMapsFieldProps {
  polygons?: { id: number; name: string; polygon: PolygonPoint[]; color?: string }[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onPolygonClick?: (fieldId: number) => void;
  editable?: boolean;
  onPolygonChange?: (points: PolygonPoint[]) => void;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;

export function GoogleMapsField({
  polygons = [],
  center,
  zoom = DEFAULT_ZOOM,
  height = "400px",
  onPolygonClick,
  editable = false,
  onPolygonChange,
}: GoogleMapsFieldProps) {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polygonRefs = useRef<google.maps.Polygon[]>([]);
  const drawingPolygonRef = useRef<google.maps.Polygon | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setApiKeyMissing(true);
      return;
    }

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    (window as any).initGoogleMaps = () => {
      setIsLoaded(true);
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=drawing,geometry`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      (window as any).initGoogleMaps = undefined;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || apiKeyMissing) return;

    const calculatedCenter = center || (polygons.length > 0 && polygons[0].polygon?.length > 0
      ? {
          lat: polygons[0].polygon.reduce((sum, p) => sum + p.lat, 0) / polygons[0].polygon.length,
          lng: polygons[0].polygon.reduce((sum, p) => sum + p.lng, 0) / polygons[0].polygon.length,
        }
      : DEFAULT_CENTER);

    const map = new google.maps.Map(mapRef.current, {
      center: calculatedCenter,
      zoom: polygons.length > 0 ? 15 : zoom,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
      },
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    polygonRefs.current.forEach(p => p.setMap(null));
    polygonRefs.current = [];
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidPolygons = false;

    polygons.forEach((field) => {
      if (!field.polygon || field.polygon.length < 3) return;
      
      hasValidPolygons = true;
      const path = field.polygon.map(p => ({ lat: p.lat, lng: p.lng }));
      
      path.forEach(p => bounds.extend(p));

      const fieldColor = field.color || "#22c55e";
      
      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: fieldColor,
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: fieldColor,
        fillOpacity: 0.35,
        map,
        clickable: true,
      });

      if (onPolygonClick) {
        polygon.addListener("click", () => onPolygonClick(field.id));
      }

      const centerLat = field.polygon.reduce((sum, p) => sum + p.lat, 0) / field.polygon.length;
      const centerLng = field.polygon.reduce((sum, p) => sum + p.lng, 0) / field.polygon.length;

      const marker = new google.maps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map,
        title: field.name,
        label: {
          text: field.name,
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
      });

      markersRef.current.push(marker);
      polygonRefs.current.push(polygon);
    });

    if (hasValidPolygons) {
      map.fitBounds(bounds, 50);
    }

    if (editable) {
      let drawingPoints: google.maps.LatLng[] = [];
      
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        drawingPoints.push(e.latLng);
        
        if (drawingPolygonRef.current) {
          drawingPolygonRef.current.setMap(null);
        }
        
        if (drawingPoints.length >= 2) {
          drawingPolygonRef.current = new google.maps.Polygon({
            paths: drawingPoints,
            strokeColor: "#3b82f6",
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.25,
            map,
            editable: true,
          });
        }

        const marker = new google.maps.Marker({
          position: e.latLng,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        markersRef.current.push(marker);
      });

      map.addListener("rightclick", () => {
        if (drawingPoints.length >= 3 && onPolygonChange) {
          const points = drawingPoints.map(p => ({
            lat: p.lat(),
            lng: p.lng(),
          }));
          onPolygonChange(points);
        }
        
        drawingPoints = [];
        if (drawingPolygonRef.current) {
          drawingPolygonRef.current.setMap(null);
          drawingPolygonRef.current = null;
        }
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
      });
    }

    return () => {
      polygonRefs.current.forEach(p => p.setMap(null));
      markersRef.current.forEach(m => m.setMap(null));
      if (drawingPolygonRef.current) {
        drawingPolygonRef.current.setMap(null);
      }
    };
  }, [isLoaded, polygons, center, zoom, onPolygonClick, editable, onPolygonChange, apiKeyMissing]);

  if (apiKeyMissing) {
    return (
      <div 
        className="w-full rounded-xl border bg-gradient-to-br from-green-900/20 via-green-800/10 to-amber-900/10 flex flex-col items-center justify-center gap-3"
        style={{ height }}
      >
        <MapPin className="w-12 h-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground text-center px-4">
          {t('fieldSummary.googleMapsNotConfigured')}
        </p>
        <p className="text-xs text-muted-foreground/70 text-center px-4">
          {t('fieldSummary.addApiKey')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="w-full rounded-xl border bg-destructive/10 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className="w-full rounded-xl border bg-muted/30 flex items-center justify-center gap-2"
        style={{ height }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-xl overflow-hidden border shadow-lg"
      style={{ height }}
      data-testid="google-maps-container"
    />
  );
}
