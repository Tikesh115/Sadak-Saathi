"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Severity = "Dangerous" | "Moderate" | "Minor";

interface MapPothole {
  id: string;
  latitude: number;
  longitude: number;
  severity: Severity;
}

interface PotholeMapProps {
  title: string;
}

function normalizeSeverity(raw: unknown): Severity {
  const value = String(raw ?? "Minor").toLowerCase();
  if (value.includes("danger")) return "Dangerous";
  if (value.includes("moderate")) return "Moderate";
  return "Minor";
}

export default function PotholeMap({ title }: PotholeMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  const [rows, setRows] = useState<MapPothole[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/potholes", { cache: "no-store" });
        const data = (await response.json()) as Array<Record<string, unknown>>;

        if (!response.ok) {
          throw new Error("Unable to fetch map data");
        }

        setRows(
          data.map((item, index) => ({
            id: String(item.id ?? `PTH-${index + 1}`),
            latitude: Number(item.latitude ?? 0),
            longitude: Number(item.longitude ?? 0),
            severity: normalizeSeverity(item.severity),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load map data");
      }
    };

    void load();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (rows.length === 0) {
      return [21.2514, 81.6296];
    }

    const latAvg = rows.reduce((sum, row) => sum + row.latitude, 0) / rows.length;
    const lngAvg = rows.reduce((sum, row) => sum + row.longitude, 0) / rows.length;
    return [latAvg, lngAvg];
  }, [rows]);

  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined" || !mapRef.current || leafletMapRef.current) return;

      const L = await import("leaflet");

      const map = L.map(mapRef.current, {
        center,
        zoom: 13,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    };

    void init();

    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }
    };
  }, [center]);

  useEffect(() => {
    const paintMarkers = async () => {
      if (!leafletMapRef.current) return;

      const L = await import("leaflet");
      const map = leafletMapRef.current as {
        eachLayer: (fn: (layer: unknown) => void) => void;
        removeLayer: (layer: unknown) => void;
        setView: (centerPoint: [number, number], zoom: number) => void;
      };

      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];

      rows.forEach((row) => {
        const color =
          row.severity === "Dangerous"
            ? "#dc2626"
            : row.severity === "Moderate"
            ? "#f59e0b"
            : "#16a34a";

        const marker = L.circleMarker([row.latitude, row.longitude], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.85,
          weight: 2,
        })
          .bindPopup(`<strong>${row.id}</strong><br/>Severity: ${row.severity}`)
          .addTo(leafletMapRef.current as never);

        markersRef.current.push(marker as unknown);
      });

      if (rows.length > 0) {
        map.setView(center, 13);
      }
    };

    void paintMarkers();
  }, [rows, center]);

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-900">{title}</h2>
        <p className="text-sm text-gray-600">Map markers: {rows.length}</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
      <div ref={mapRef} className="w-full h-[380px] bg-gray-100" />
    </section>
  );
}
