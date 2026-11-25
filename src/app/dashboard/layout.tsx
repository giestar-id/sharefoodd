'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AppNavbar from '@/components/AppNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoaded } = useApp();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  if (isLoaded && !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <p className="text-sm text-[#666666]">Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col pb-18 sm:pb-0"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* Universal Top Navbar with All Navigation Links */}
      <AppNavbar />

      {/* Main Centered Container Khas hmm/sharefood .container */}
      <main className="w-full max-w-6xl mx-auto flex-1 p-3 sm:p-6">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-[#888888]">
              Memuat data...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      {/* Footer Khas hmm/sharefood */}
      <footer className="bg-[#6B1D2F] text-[#F9F5EC] text-center py-3.5 px-4 text-xs mt-auto border-t border-white/10">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}
