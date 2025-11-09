"use client";

import { getAllReports } from "@/report";
import { useEffect, useState } from "react";

export default function Test() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReports() {
      const response = await getAllReports();
      const data = await response.json();
      setReports(data);
      console.log(data);
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