import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b-4 border-orange-500 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="Government Emblem"
            className="h-12 sm:h-16 w-auto"
          />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">Government of India</p>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-wide truncate">
              Sadak Saathi
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              National Pothole Intelligence and Repair Portal
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded transition"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
