"use client";

import { useState } from "react";
import { TabButton, TabView } from "@/components/ui/tab-view";
import "mapbox-gl/dist/mapbox-gl.css";
import GlMap from "react-map-gl/mapbox";

export default function Dashboard() {
  const [value, setValue] = useState("map");
  return (
    <main className="flex flex-1 flex-col items-center justify-center relative pt-[72px]">
      <TabView onChange={(value) => setValue(value)}>
        <TabButton
          name="Map"
          value="map"
          selected={value === "map"}
          onChange={(value) => setValue(value)}
        />
        <TabButton
          name="List"
          value="list"
          selected={value === "list"}
          onChange={(value) => setValue(value)}
        />
      </TabView>
      {value === "map" && (
        <div className="w-full h-full relative flex flex-1">
          <GlMap
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              longitude: -114.0719,
              latitude: 51.0447,
              zoom: 11,
            }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
          />
        </div>
      )}
      {value === "list" && (
        <div className="w-full h-full relative flex flex-1">
          <div className="w-full h-full bg-background rounded-md">
            <h1>List</h1>
          </div>
        </div>
      )}
    </main>
  );
}
