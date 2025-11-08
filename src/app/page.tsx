"use client";

import GlMap from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center relative">
      <GlMap
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14
      }}
      style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0}}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    />
    </main>
  );
}
