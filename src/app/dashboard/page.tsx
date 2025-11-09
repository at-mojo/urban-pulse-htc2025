"use client";

import { useEffect, useMemo, useState } from "react";
import { GlMap } from "@/components/gl-map";
import { ReporterUI } from "@/components/reporter-ui";
import { TabButton, TabView } from "@/components/ui/tab-view";
import type { Report } from "@prisma/client";
import { getAllReports } from "@/report";
export default function Dashboard() {
  const [value, setValue] = useState("map");
  const [reports, setReports] = useState<Report[]>([]);
  const MapBoxMap = useMemo(() => {
    return GlMap<Report>;
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      const reports = await getAllReports();
      setReports(reports as unknown as Report[]);
      console.log(reports);
    };
    fetchReports();
  }, []);

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
          <MapBoxMap
            pins={[
              ...reports.map((report) => ({
                id: report.id,
                lat: parseFloat(report.lat),
                lon: parseFloat(report.lon),
                additionalData: report,
              })),
            ]}
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
      <ReporterUI />
    </main>
  );
}
