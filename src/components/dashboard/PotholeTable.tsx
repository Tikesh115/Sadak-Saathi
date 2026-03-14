"use client";

import { useEffect, useMemo, useState } from "react";

type Severity = "Dangerous" | "Moderate" | "Minor";
type RepairStatus = "Detected" | "Under Review" | "Repair Scheduled" | "Repaired";

interface PotholeItem {
  id: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  timestamp?: string;
}

interface PotholeTableProps {
  title: string;
  allowStatusUpdate?: boolean;
}

const statusOptions: RepairStatus[] = ["Detected", "Under Review", "Repair Scheduled", "Repaired"];

function normalizeSeverity(raw: unknown): Severity {
  const value = String(raw ?? "Minor").toLowerCase();
  if (value.includes("danger")) return "Dangerous";
  if (value.includes("moderate")) return "Moderate";
  return "Minor";
}

export default function PotholeTable({ title, allowStatusUpdate = false }: PotholeTableProps) {
  const [rows, setRows] = useState<PotholeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, RepairStatus>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/potholes", { cache: "no-store" });
        const data = (await response.json()) as Array<Record<string, unknown>>;

        if (!response.ok) {
          throw new Error("Unable to fetch pothole records");
        }

        const normalized = data.map((item, index) => ({
          id: String(item.id ?? `PTH-${index + 1}`),
          latitude: Number(item.latitude ?? 0),
          longitude: Number(item.longitude ?? 0),
          severity: normalizeSeverity(item.severity),
          timestamp: typeof item.timestamp === "string" ? item.timestamp : undefined,
        }));

        setRows(normalized);
        setStatusMap(
          normalized.reduce<Record<string, RepairStatus>>((acc, row) => {
            acc[row.id] = "Detected";
            return acc;
          }, {})
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load potholes");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const totals = useMemo(
    () => ({
      Dangerous: rows.filter((row) => row.severity === "Dangerous").length,
      Moderate: rows.filter((row) => row.severity === "Moderate").length,
      Minor: rows.filter((row) => row.severity === "Minor").length,
    }),
    [rows]
  );

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-900">{title}</h2>
          <p className="text-sm text-gray-600">Total reports: {rows.length}</p>
        </div>
        <div className="text-xs font-semibold text-gray-700 flex gap-3">
          <span className="text-red-600">Dangerous: {totals.Dangerous}</span>
          <span className="text-amber-600">Moderate: {totals.Moderate}</span>
          <span className="text-green-600">Minor: {totals.Minor}</span>
        </div>
      </div>

      {loading && <p className="p-5 text-sm text-gray-600">Loading pothole reports...</p>}
      {error && <p className="p-5 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-bold">ID</th>
                <th className="px-4 py-3 text-left font-bold">Latitude</th>
                <th className="px-4 py-3 text-left font-bold">Longitude</th>
                <th className="px-4 py-3 text-left font-bold">Severity</th>
                <th className="px-4 py-3 text-left font-bold">Detected At</th>
                {allowStatusUpdate && <th className="px-4 py-3 text-left font-bold">Repair Status</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={allowStatusUpdate ? 6 : 5}>
                    No potholes found.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-blue-900">{row.id}</td>
                  <td className="px-4 py-3">{row.latitude.toFixed(5)}</td>
                  <td className="px-4 py-3">{row.longitude.toFixed(5)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                        row.severity === "Dangerous"
                          ? "bg-red-100 text-red-700"
                          : row.severity === "Moderate"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.timestamp ?? "-"}</td>
                  {allowStatusUpdate && (
                    <td className="px-4 py-3">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                        value={statusMap[row.id] ?? "Detected"}
                        onChange={(e) =>
                          setStatusMap((prev) => ({
                            ...prev,
                            [row.id]: e.target.value as RepairStatus,
                          }))
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
