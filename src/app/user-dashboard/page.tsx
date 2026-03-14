import MainLayout from "@/components/layout/MainLayout";
import UploadVideo from "@/components/dashboard/UploadVideo";
import PotholeTable from "@/components/dashboard/PotholeTable";
import PotholeMap from "@/components/dashboard/PotholeMap";

export default function UserDashboardPage() {
  return (
    <MainLayout tickerMessage="User dashboard: upload footage, review detections, and verify map locations.">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">User Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Upload Video, Detection Results, and Map Visualization.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UploadVideo />
        <PotholeMap title="Map Visualization" />
      </div>

      <div className="mt-6">
        <PotholeTable title="Detection Results" />
      </div>
    </MainLayout>
  );
}