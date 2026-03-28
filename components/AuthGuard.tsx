"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  // Public pages always render
  if (PUBLIC_PATHS.includes(pathname)) return <>{children}</>;

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  // Not logged in — redirect in progress
  if (!user) return null;

  return <>{children}</>;
}
