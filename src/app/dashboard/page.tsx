"use client";

import { useEffect, useMemo, useState } from "react";
import { GlMap } from "@/components/gl-map";
import { ReporterUI } from "@/components/reporter-ui";
import { TabButton, TabView } from "@/components/ui/tab-view";
import type { Report } from "@prisma/client";
import { getAllReports } from "@/report";
import EventsTable from "@/components/events-table";
import { ChevronsUpIcon, ChevronUpIcon, MinusIcon } from "lucide-react";
import { useUser } from "@stackframe/stack";
export default function Dashboard() {
  const [value, setValue] = useState("map");
  const [reports, setReports] = useState<Report[]>([]);
  const MapBoxMap = useMemo(() => {
    return GlMap<Report>;
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      const reports = await getAllReports();
      setReports(reports.content as Report[]);
    };
    fetchReports();
  }, []);

  const user = useUser();

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
          name="Overview"
          value="overview"
          selected={value === "overview"}
          onChange={(value) => setValue(value)}
        />
        <TabButton
          name="My Reports"
          value="my-reports"
          selected={value === "my-reports"}
          onChange={(value) => setValue(value)}
        />
      </TabView>
      {value === "map" && (
        <div className="w-full h-full relative flex flex-1">
          <MapBoxMap
            { ...(reports.length > 0 && {
              pins: [
                ...reports.map((report) => ({
                  id: report.id,
                  lat: report.lat,
                  lon: report.lon,
                  additionalData: report,
                })),
              ],
            })}
          />
        </div>
      )}
      {value === "overview" && (
        <div className="w-full h-full relative flex flex-1">
          <div className="w-full h-full bg-background rounded-md p-4">
            <h1 className="text-3xl font-bold font-departure-mono">Overview</h1>
            <div className="w-full h-full flex flex-row gap-4 bg-background rounded-xl p-4 border-2 border-border mt-4">
              <div className="flex-2 h-full">
                <EventsTable reports={reports} />
              </div>
              <div className="flex flex-col gap-4 flex-1 h-full">
                <div className="w-full bg-background rounded-xl p-4 border-2 border-border flex flex-row items-center gap-4">
                  <ChevronsUpIcon className="w-32 h-32" color="#e44d4d" /> <span className="text-2xl font-bold font-departure-mono">{reports.filter((report) => report.urgency === "HIGH").length} High Priority Reports</span>
                </div>
                <div className="w-full bg-background rounded-xl p-4 border-2 border-border flex flex-row items-center gap-4">
                  <ChevronUpIcon className="w-32 h-32" color="#f18227" /> <span className="text-2xl font-bold font-departure-mono">{reports.filter((report) => report.urgency === "MEDIUM").length} Medium Priority Reports</span>
                </div>
                <div className="w-full bg-background rounded-xl p-4 border-2 border-border flex flex-row items-center gap-4">
                  <MinusIcon className="w-32 h-32" color="#0ea55f" /> <span className="text-2xl font-bold font-departure-mono">{reports.filter((report) => report.urgency === "LOW").length} Low Priority Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {value === "my-reports" && (
        <div className="w-full h-full relative flex flex-1">
          <div className="w-full h-full bg-background rounded-md p-4">
            <h1 className="text-3xl font-bold font-departure-mono">My Reports</h1>
            <div className="w-full h-full flex flex-row gap-4 bg-background rounded-xl p-4 border-2 border-border mt-4">
              <div className="flex-2 h-full">
                <EventsTable reports={reports.filter((report) => report.userId === user?.id)} />
              </div>
              <div className="flex flex-col gap-4 flex-1 h-full">
                <div className="w-full bg-background rounded-xl p-4 border-2 border-border flex flex-row items-center gap-4">
                  <ChevronsUpIcon className="w-32 h-32" color="#e44d4d" /> <span className="text-2xl font-bold font-departure-mono">{reports.filter((report) => report.urgency === "HIGH" && report.userId === user?.id).length} High Priority Reports</span>
                </div>
                <div className="w-full bg-background rounded-xl p-4 border-2 border-border flex flex-row items-center gap-4">
                  <ChevronUpIcon className="w-32 h-32" color="#f18227" /> <span className="text-2xl font-bold font-departure-mono">{reports.filter((report) => report.urgency === "MEDIUM" && report.userId === user?.id).length} Medium Priority Reports</span>
                </div>
                <div className="w-full bg-background rounded-xl p-4 border-2 border-border flex flex-row items-center gap-4">
                  <MinusIcon className="w-32 h-32" color="#0ea55f" /> <span className="text-2xl font-bold font-departure-mono">{reports.filter((report) => report.urgency === "LOW" && report.userId === user?.id).length} Low Priority Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ReporterUI />
    </main>
  );
}
