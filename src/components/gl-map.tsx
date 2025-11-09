"use client";

import { useState, useCallback } from "react";
import MapBoxMap, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPinIcon } from "lucide-react";

export const GlMap = ({
  longitude,
  latitude,
  zoom,
  style,
  onPinChange,
  initialPin, // optional: initial pin position
  allowPinDrop = false, // optional: allow pin to be set on click
}: {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  style?: React.CSSProperties;
  onPinChange?: (coords: { lat: number; lon: number }) => void;
  initialPin?: { lat: number; lon: number };
  allowPinDrop?: boolean;
}) => {
  // State for pin (call it marker for clarity)
  const [pin, setPin] = useState<{ lat: number; lon: number } | null>(
    initialPin
      ? initialPin
      : latitude !== undefined && longitude !== undefined
      ? { lat: latitude, lon: longitude }
      : null
  );

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

  return (
    <MapBoxMap
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
    >
      {pin && (
        <Marker longitude={pin.lon} latitude={pin.lat} anchor="center">
          <MapPinIcon className="w-8 h-8 text-primary" fill="red" />
        </Marker>
      )}
    </MapBoxMap>
  );
};
