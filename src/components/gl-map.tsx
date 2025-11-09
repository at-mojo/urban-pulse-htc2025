"use client";

import { useState, useCallback, useRef } from "react";
import MapBoxMap, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { ViewStateChangeInfo } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPinIcon } from "lucide-react";

// Type for a pin
export type PinType<T extends object> = { id: string; lat: number; lon: number; additionalData?: T };

export const GlMap = <T extends object>({
  longitude,
  latitude,
  zoom,
  style,
  onPinChange,
  initialPin, // optional: initial pin position
  allowPinDrop = false, // optional: allow pin to be set on click
  pins = [],
}: {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  style?: React.CSSProperties;
  onPinChange?: (coords: { lat: number; lon: number }) => void;
  initialPin?: { lat: number; lon: number };
  allowPinDrop?: boolean;
  pins?: PinType<T>[];
}) => {
  // State for pin (call it marker for clarity)
  const [pin, setPin] = useState<{ lat: number; lon: number } | null>(
    initialPin
      ? initialPin
      : latitude !== undefined && longitude !== undefined
      ? { lat: latitude, lon: longitude }
      : null
  );

  // State for current zoom (needed entirely so our map doesn't re-render 32179371298892371 times per second :D)
  const [_, setCurrentZoom] = useState<number>(zoom || 11);

  // Ref for the map to read zoom
  const mapRef = useRef<typeof MapBoxMap | null>(null);

  // When user clicks, drop a pin
  const handleMapClick = useCallback(
    (evt: { lngLat: [number, number] }) => {
      if (!allowPinDrop) return;
      const [lon, lat] = evt.lngLat;
      setPin({ lat, lon });
      if (onPinChange) onPinChange({ lat, lon });
    },
    [onPinChange, allowPinDrop]
  );

  // Track zoom level to toggle heatmap
  const handleMove = useCallback((e: ViewStateChangeInfo) => {
    setCurrentZoom(e.viewState.zoom);
  }, []);

  // GeoJSON for heatmap
  const pinsAsGeoJSON = {
    type: "FeatureCollection",
    features: pins.map((pin) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [pin.lon, pin.lat] },
    })),
  };

  // Heatmap Layer definition
  const heatmapLayer = {
    id: "pins-heatmap",
    type: "heatmap",
    source: "pins-heatmap-source",
    maxzoom: 23,
    paint: {
      // Increase the heatmap weight based on frequency and property magnitude
      "heatmap-weight": ["interpolate", ["linear"], ["zoom"], 7, 1, 15, 3],
      // Increase the heatmap color weight weight by zoom level
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 1,
        15, 3
      ],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(255,0,0,0)",
        0.2, "#ffb3b3",
        0.4, "#ff6666",
        0.6, "#ff3232",
        0.8, "#ff2020",
        1, "#a50000"
      ],
      // Adjust the heatmap radius by zoom level
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 40,
        15, 80
      ],
      // Decrease the heatmap opacity at higher zoom levels
      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 0.9,
        12, 0.75,
        15, 0.3
      ],
    }
  } as const;

  // Show heatmap at zoom <= 11.5
  const showHeatmap = pins.length > 0;

  return (
    <MapBoxMap
      ref={mapRef as any}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        // default to calgary
        longitude: longitude || -114.0719,
        latitude: latitude || 51.0447,
        zoom: zoom || 11,
      }}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        ...style,
      }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={(e) => handleMapClick({ lngLat: [e.lngLat.lng, e.lngLat.lat] })}
      onMove={(e) => handleMove(e as any)}
    >
      {/* Show user-dropped pin */}
      {pin && (
        <Marker longitude={pin.lon} latitude={pin.lat} anchor="center">
          <MapPinIcon className="w-8 h-8 text-primary" fill="red" />
        </Marker>
      )}
      {/* Heatmap (show only if zoomed out and with data) */}
      {showHeatmap && (
        <Source id="pins-heatmap-source" type="geojson" data={pinsAsGeoJSON as any}>
          <Layer {...heatmapLayer as any} />
        </Source>
      )}
    </MapBoxMap>
  );
};
