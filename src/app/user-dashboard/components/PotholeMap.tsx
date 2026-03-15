'use client';

import { useEffect, useRef, useState } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface PotholeMarker {
  id: string;
  lat: number;
  lng: number;
  severity: 'Dangerous' | 'Moderate' | 'Minor';
  confidence: number;
  status: string;
  timestamp: string;
}

const MOCK_MARKERS: PotholeMarker[] = [
  { id: 'PTH-001', lat: 21.2513, lng: 81.6293, severity: 'Dangerous', confidence: 0.94, status: 'Reported', timestamp: '00:00:12' },
  { id: 'PTH-002', lat: 21.2518, lng: 81.6298, severity: 'Moderate', confidence: 0.87, status: 'Under Review', timestamp: '00:00:30' },
  { id: 'PTH-003', lat: 21.2524, lng: 81.6305, severity: 'Minor', confidence: 0.76, status: 'Detected', timestamp: '00:00:49' },
  { id: 'PTH-004', lat: 21.2531, lng: 81.6311, severity: 'Dangerous', confidence: 0.96, status: 'Reported', timestamp: '00:01:07' },
  { id: 'PTH-005', lat: 21.2539, lng: 81.6319, severity: 'Moderate', confidence: 0.81, status: 'Repair Scheduled', timestamp: '00:01:29' },
  { id: 'PTH-006', lat: 21.2546, lng: 81.6325, severity: 'Minor', confidence: 0.72, status: 'Detected', timestamp: '00:01:41' },
  { id: 'PTH-007', lat: 21.2553, lng: 81.6332, severity: 'Dangerous', confidence: 0.91, status: 'Reported', timestamp: '00:02:03' },
  { id: 'PTH-008', lat: 21.2561, lng: 81.6341, severity: 'Moderate', confidence: 0.85, status: 'Repaired', timestamp: '00:02:24' },
  { id: 'PTH-009', lat: 21.2568, lng: 81.6348, severity: 'Minor', confidence: 0.68, status: 'Closed', timestamp: '00:02:36' },
  { id: 'PTH-010', lat: 21.2574, lng: 81.6355, severity: 'Moderate', confidence: 0.79, status: 'Under Review', timestamp: '00:02:58' },
  { id: 'PTH-011', lat: 21.2581, lng: 81.6362, severity: 'Dangerous', confidence: 0.93, status: 'Reported', timestamp: '00:03:19' },
];

const SEVERITY_COLORS = {
  Dangerous: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
};

export default function PotholeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedMarker, setSelectedMarker] = useState<PotholeMarker | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        // Backend integration: GET /api/potholes?user_id=current for marker data
        const L = await import('leaflet');

        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current, {
          center: [21.2545, 81.6325],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        // Add markers
        MOCK_MARKERS.forEach((marker) => {
          const color = SEVERITY_COLORS[marker.severity];
          const size = marker.severity === 'Dangerous' ? 16 : marker.severity === 'Moderate' ? 13 : 10;

          const icon = L.divIcon({
            className: '',
            html: `<div style="
              width: ${size}px;
              height: ${size}px;
              background: ${color};
              border: 2px solid ${color}99;
              border-radius: 50%;
              box-shadow: 0 0 ${marker.severity === 'Dangerous' ? '12px' : '8px'} ${color}60;
              cursor: pointer;
              transition: transform 0.15s ease;
            " class="pothole-marker"></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

          leafletMarker.bindPopup(`
            <div style="font-family: 'DM Sans', sans-serif; min-width: 180px; padding: 4px 0;">
              <div style="font-size: 12px; font-weight: 600; color: hsl(220 20% 92%); margin-bottom: 6px;">
                ${marker.id}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="
                  font-size: 11px;
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-weight: 600;
                  background: ${color}20;
                  color: ${color};
                  border: 1px solid ${color}40;
                ">${marker.severity}</span>
              </div>
              <div style="font-size: 11px; color: hsl(220 12% 65%); font-family: 'JetBrains Mono', monospace; margin-bottom: 4px;">
                ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}
              </div>
              <div style="font-size: 11px; color: hsl(220 12% 65%);">
                Confidence: ${Math.round(marker.confidence * 100)}% · ${marker.status}
              </div>
            </div>
          `);
        });

        leafletMapRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error('Map init error:', err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const counts = {
    Dangerous: MOCK_MARKERS.filter((m) => m.severity === 'Dangerous').length,
    Moderate: MOCK_MARKERS.filter((m) => m.severity === 'Moderate').length,
    Minor: MOCK_MARKERS.filter((m) => m.severity === 'Minor').length,
  };

  return (
    <div className="card overflow-hidden">
      {/* Map header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h2 className="text-base font-600 text-text">Pothole Map</h2>
          <p className="text-xs text-muted-foreground">{MOCK_MARKERS.length} potholes plotted · Raipur, NH-30</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            {(['Dangerous', 'Moderate', 'Minor'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
                className={`flex items-center gap-1.5 text-xs font-500 transition-opacity ${filterSeverity !== 'all' && filterSeverity !== sev ? 'opacity-40' : ''}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: SEVERITY_COLORS[sev] }}
                />
                <span className="text-text-secondary">{sev}</span>
                <span className="font-mono text-[10px] text-muted-foreground">({counts[sev]})</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${showHeatmap
                ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-text hover:bg-surface-elevated'
              }`}
          >
            <Layers size={14} />
            Heatmap
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative" style={{ height: '380px' }}>
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Loading map…</p>
            </div>
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Map unavailable — check your connection</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {MOCK_MARKERS.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-elevated">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[m.severity] }} />
                    <span className="font-mono text-[10px] text-text-secondary">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        {/* Heatmap overlay indicator */}
        {showHeatmap && mapLoaded && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-sm border border-border/60 text-xs text-warning">
            <Layers size={12} />
            Risk heatmap active
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
          {[
            { icon: ZoomIn, label: 'Zoom in', action: () => (leafletMapRef.current as { zoomIn?: () => void })?.zoomIn?.() },
            { icon: ZoomOut, label: 'Zoom out', action: () => (leafletMapRef.current as { zoomOut?: () => void })?.zoomOut?.() },
            { icon: Maximize2, label: 'Fit all markers', action: () => { } },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              title={label}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface/90 backdrop-blur-sm border border-border/60 text-muted-foreground hover:text-text hover:bg-surface-elevated transition-colors"
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Map footer stats */}
      <div className="grid grid-cols-3 divide-x divide-border/40 border-t border-border/60">
        {(Object.entries(counts) as [keyof typeof counts, number][]).map(([sev, count]) => (
          <div key={sev} className="px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[sev] }} />
              <span className="font-mono text-base font-700 text-text">{count}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{sev}</p>
          </div>
        ))}
      </div>
    </div>
  );
}