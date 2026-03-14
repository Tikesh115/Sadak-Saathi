"use client";

import { FormEvent, useState } from "react";

export default function UploadVideo() {
  const [video, setVideo] = useState<File | null>(null);
  const [gps, setGps] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!video) {
      setMessage("Please select a video file.");
      return;
    }

    setLoading(true);
    setMessage("Uploading and processing...");

    try {
      const formData = new FormData();
      formData.append("video", video);
      if (gps) {
        formData.append("gps", gps);
      }

      const response = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.details || result?.error || "Detection failed");
      }

      setMessage(`Detection complete. Potholes found: ${result?.potholes ?? 0}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
      <h2 className="text-xl font-bold text-blue-900 mb-1">Upload Video</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload road footage for automated pothole detection.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Road Video</label>
          <input
            type="file"
            accept="video/*"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
            onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">GPS Log (Optional)</label>
          <input
            type="file"
            accept=".csv,.gpx"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
            onChange={(e) => setGps(e.target.files?.[0] ?? null)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded transition"
        >
          {loading ? "Processing..." : "Start Detection"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          {message}
        </p>
      )}
    </section>
  );
}
