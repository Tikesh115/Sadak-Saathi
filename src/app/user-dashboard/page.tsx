"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import UploadVideo, { DetectionResponse } from "@/components/dashboard/UploadVideo";
import PotholeMap from "@/components/dashboard/PotholeMap";
import VideoDetectionPreview from "@/components/dashboard/VideoDetectionPreview";

export default function UserDashboardPage() {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [detections, setDetections] = useState<unknown[]>([]);
  const [frames, setFrames] = useState(0);
  const [processedVideoURL, setProcessedVideoURL] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [videoURL]);

  const handleVideoSelected = ({ videoURL: nextVideoURL }: { file: File; videoURL: string }) => {
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }

    setVideoURL(nextVideoURL);
    setProcessedVideoURL(null);
    setDetections([]);
    setFrames(0);
  };

  const handleDetectionComplete = (result: DetectionResponse) => {
    setDetections(Array.isArray(result.detections) ? result.detections : []);
    setFrames(Number(result.frames ?? 0));
    setProcessedVideoURL(typeof result.processedVideoURL === "string" ? result.processedVideoURL : null);
  };

  return (
    <MainLayout tickerMessage="User dashboard: upload footage, review detections, and verify map locations.">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">User Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Upload Video, AI Detection Preview, and Map Visualization.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UploadVideo
          onVideoSelected={handleVideoSelected}
          onDetectionStateChange={setDetectionLoading}
          onDetectionComplete={handleDetectionComplete}
        />

        <VideoDetectionPreview
          videoURL={videoURL}
          processedVideoURL={processedVideoURL}
          detections={detections}
          frames={frames}
          loading={detectionLoading}
        />

        <div className="xl:col-span-2">
          <PotholeMap title="Map Visualization" />
        </div>
      </div>
    </MainLayout>
  );
}
