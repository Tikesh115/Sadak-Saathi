"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "@/hooks/useAuth";

const staticNavItems = [
  { label: "Home", href: "/" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap gap-x-5 gap-y-2 items-center">
        {staticNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-semibold hover:text-orange-300 transition"
          >
            {item.label}
          </Link>
        ))}
        <Link href="/social-feed" className="text-sm font-semibold hover:text-yellow-300 transition">Social Feed</Link>
        {!loading && (
          <>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold hover:text-orange-300 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-auto text-sm font-semibold hover:text-orange-300 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold hover:text-orange-300 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold hover:text-orange-300 transition"
                >
                  Register
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
