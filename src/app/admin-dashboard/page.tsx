
"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PotholeTable from "@/components/dashboard/PotholeTable";
import PotholeMap from "@/components/dashboard/PotholeMap";
import useAuth from "../hooks/useAuth";

type RepairStatus = "Detected" | "Under Review" | "Repair Scheduled" | "Repaired";

const initialRepairRows: Array<{ zone: string; pending: number; status: RepairStatus }> = [
  { zone: "Raipur North", pending: 14, status: "Under Review" },
  { zone: "Raipur South", pending: 9, status: "Repair Scheduled" },
  { zone: "NH-30 Corridor", pending: 7, status: "Detected" },
  { zone: "Bypass Stretch", pending: 5, status: "Repaired" },
];

export default function AdminDashboardPage() {
  useAuth();
  const [repairRows, setRepairRows] = useState(initialRepairRows);

  return (
    <MainLayout tickerMessage="Admin dashboard: review all reports, monitor live map, and update repair status.">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Pothole Reports, Repair Status, and Map Monitoring.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-xl font-bold text-blue-900 mb-1">Repair Status</h2>
          <p className="text-sm text-gray-600 mb-4">Update operational status by zone.</p>

          <div className="space-y-3">
            {repairRows.map((row) => (
              <div
                key={row.zone}
                className="border border-gray-200 rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-blue-900">{row.zone}</p>
                  <p className="text-xs text-gray-600">Pending potholes: {row.pending}</p>
                </div>
                <select
                  value={row.status}
                  onChange={(e) => {
                    const value = e.target.value as RepairStatus;
                    setRepairRows((prev) =>
                      prev.map((item) => (item.zone === row.zone ? { ...item, status: value } : item))
                    );
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-xs bg-gray-50"
                >
                  <option value="Detected">Detected</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Repair Scheduled">Repair Scheduled</option>
                  <option value="Repaired">Repaired</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <PotholeMap title="Map Monitoring" />
      </div>

      <div className="mt-6">
        <PotholeTable title="Pothole Reports" allowStatusUpdate />
      </div>
    </MainLayout>
  );
}