'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { requests, user, logout } = useApp();

  // Count pending incoming requests for user's foods
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  const navItems = [
    {
      title: 'Ringkasan',
      href: '/dashboard',
      emoji: '📊',
      badge: null,
      active: pathname === '/dashboard',
    },
    {
      title: 'Makanan Saya',
      href: '/dashboard/makanan-saya',
      emoji: '🍲',
      badge: null,
      active: pathname.startsWith('/dashboard/makanan-saya'),
    },
    {
      title: 'Makanan Diambil',
      href: '/dashboard/makanan-diambil',
      emoji: '🎁',
      badge: null,
      active: pathname.startsWith('/dashboard/makanan-diambil'),
    },
    {
      title: 'Permintaan Masuk',
      href: '/dashboard/permintaan-masuk',
      emoji: '🔔',
      badge: pendingCount > 0 ? pendingCount : null,
      active: pathname === '/dashboard/permintaan-masuk',
    },
    {
      title: 'Riwayat',
      href: '/dashboard/riwayat',
      emoji: '📜',
      badge: null,
      active: pathname === '/dashboard/riwayat',
    },
    {
      title: 'Profil Akun',
      href: '/dashboard/profil',
      emoji: '👤',
      badge: null,
      active: pathname === '/dashboard/profil',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar with Signature hmm/sharefood Palette (#6B1D2F, Segoe UI) */}
      <aside
        id="sidebar"
        style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
        className={`fixed left-0 top-0 h-screen w-64 bg-[#6B1D2F] text-white z-50 flex flex-col justify-between py-5 px-4 select-none transition-transform duration-300 shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-5">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 pb-4">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <span className="text-2xl">🍲</span>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-[#F9F5EC] tracking-tight">
                  ShareFood
                </span>
                <span className="text-[11px] text-white/75 font-normal">
                  Kurangi Sampah Makanan
                </span>
              </div>
            </Link>

            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg cursor-pointer"
              aria-label="Tutup Menu"
            >
              ✕
            </button>
          </div>

          {/* Quick Action: Bagikan Makanan (btn-green #2E7D32) */}
          <div className="px-1">
            <Link
              href="/makanan/buat"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#246B27] text-white py-2.5 px-4 rounded-md font-semibold text-sm transition-all shadow-xs"
            >
              <span className="text-base">➕</span>
              <span>Bagikan Makanan</span>
            </Link>
          </div>

          {/* Nav Links with Signature Emojis */}
          <nav className="flex flex-col gap-1 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 px-2 py-1">
              Menu Navigasi
            </span>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  item.active
                    ? 'bg-white/20 text-white font-bold shadow-xs'
                    : 'text-[#F9F5EC] hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.title}</span>
                </div>
                {item.badge !== null && (
                  <span className="bg-[#E65100] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="my-2 border-t border-white/10"></div>

            {/* Public Food Catalog Link */}
            <Link
              href="/makanan"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#F9F5EC]/90 hover:bg-white/10 transition-colors"
            >
              <span className="text-base">🔍</span>
              <span>Katalog Publik Makanan</span>
            </Link>

            <Link
              href="/panduan"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#F9F5EC]/90 hover:bg-white/10 transition-colors"
            >
              <span className="text-base">📖</span>
              <span>Panduan Komunitas</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-3 border-t border-white/10 px-2 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 p-2 rounded-md bg-black/15">
              <div className="w-8 h-8 rounded-full bg-[#8B263E] border border-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-white truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-white/70 truncate">
                  {user.roleBadge}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-white/60 pt-1">
            <Link href="/" className="hover:text-white transition-colors">
              ← Beranda
            </Link>
            {user && (
              <button
                onClick={() => logout()}
                className="text-rose-200 hover:text-white transition-colors cursor-pointer"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
