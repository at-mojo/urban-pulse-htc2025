"use client";

import MapBoxMap from "react-map-gl/mapbox";

export const GlMap = ({
  longitude,
  latitude,
  zoom,
  style,
}: {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  style?: React.CSSProperties;
}) => {
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
    />
  );
};
