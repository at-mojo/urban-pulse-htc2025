"use client";

import { getAllReports } from "@/report";
import { useEffect, useState } from "react";
import type { Report } from "@prisma/client";

export default function Test() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    async function fetchReports() {
      const data = await getAllReports();
      setReports(data.content);
    }

    fetchReports();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center relative">
      {reports.map((report) => (
        <div key={report.id} className="p-4 m-2 border rounded w-96">
          <h2 className="text-xl font-bold mb-2">Report ID: {report.id}</h2>
        </div>
      ))}
    </main>
  );
}