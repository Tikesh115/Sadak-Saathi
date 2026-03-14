"use client";

import { useEffect, useState } from "react";

interface VideoDetectionPreviewProps {
  videoURL: string | null;
  processedVideoURL?: string | null;
  detections: unknown[];
  frames: number;
  loading: boolean;
}

export default function VideoDetectionPreview({
  videoURL,
  processedVideoURL,
  frames,
  loading,
}: VideoDetectionPreviewProps) {
  const [detectionCount, setDetectionCount] = useState(0);
  const [frameCount, setFrameCount] = useState(frames);
  const [streamReady, setStreamReady] = useState(false);

  useEffect(() => {
    setDetectionCount(0);
    setFrameCount(0);
    setStreamReady(false);

    if (!processedVideoURL) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch("http://localhost:5000/detection_count");
        const data = (await response.json()) as {
          detections?: number;
          frames?: number;
        };

        setDetectionCount(Number(data.detections ?? 0));
        setFrameCount(Number(data.frames ?? 0));
      } catch {
        // Leave the current counts intact when polling fails.
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [processedVideoURL]);

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
      <h2 className="text-xl font-bold text-blue-900 mb-1">AI Detection Preview</h2>
      <p className="text-sm text-gray-600 mb-4">Visual preview of detected potholes on uploaded footage.</p>

      <div className="relative w-full bg-gray-100 rounded overflow-hidden border border-gray-200">
        {processedVideoURL ? (
          <>
            <img
              src={processedVideoURL}
              className="w-full h-80 object-contain bg-black"
              alt="AI Detection Stream"
              onLoad={() => setStreamReady(true)}
            />

            {(loading || (processedVideoURL && !streamReady)) && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <p className="text-white text-sm font-semibold">Running AI detection...</p>
              </div>
            )}
          </>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className="text-sm text-gray-600">
              {videoURL ? "Video uploaded. Start detection to see live AI stream." : "Upload a video and start detection to see preview."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-blue-50 border border-blue-100 rounded px-3 py-2">
          Frames analyzed: <span className="font-bold text-blue-900">{frameCount}</span>
        </div>
      </div>
    </section>
  );
}
