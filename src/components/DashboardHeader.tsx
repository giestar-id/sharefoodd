'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function DashboardHeader({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { user, logout, login } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E8E2D5] z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-xl text-[#333333] hover:bg-[#F9F5EC] transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Buka Menu"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div>
          <h1 className="font-bold text-base sm:text-lg text-[#6B1D2F] leading-tight">
            Halo, {user ? user.name.split(' ')[0] : 'Tamu'} 👋
          </h1>
          <p className="text-xs text-[#666666] hidden sm:block">
            {user
              ? 'Selamat datang di pusat kendali donasimu'
              : 'Silakan masuk akun untuk mengelola makanan'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Profile Pill & Dropdown / Login Button */}
        {user ? (
          <div className="relative">
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-1 cursor-pointer p-1 rounded-xl hover:bg-[#F9F5EC] transition-colors"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-[#333333]">
                  {user.name}
                </span>
                <span className="text-[10px] font-semibold text-[#6B1D2F] bg-[#F5EAEB] border border-[#6B1D2F]/20 px-2 py-0.5 rounded-full">
                  {user.roleBadge}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#6B1D2F] flex items-center justify-center text-white shadow-xs overflow-hidden">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                )}
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#666666] hidden md:inline">
                expand_more
              </span>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E2D5] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-[#E8E2D5] text-xs">
                  <span className="font-bold text-[#333333] block truncate">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-[#888888] block truncate">
                    {user.email}
                  </span>
                </div>

                <Link
                  href="/dashboard/profil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#333333] hover:bg-[#F9F5EC]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#6B1D2F]">
                    person
                  </span>
                  Profil & Pengaturan
                </Link>

                <div className="border-t border-[#E8E2D5] my-1"></div>

                {/* Quick Account Switcher (Budi / Siti) */}
                <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  Ganti Akun Demo:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    login('budi.santoso@email.com');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-1.5 text-xs text-left cursor-pointer hover:bg-[#F9F5EC] ${
                    user.email === 'budi.santoso@email.com'
                      ? 'font-bold text-[#6B1D2F]'
                      : 'text-[#555555]'
                  }`}
                >
                  <span>Budi Santoso (Donatur)</span>
                  {user.email === 'budi.santoso@email.com' && (
                    <span className="text-xs">✓</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    login('siti.rahma@email.com');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-1.5 text-xs text-left cursor-pointer hover:bg-[#F9F5EC] ${
                    user.email === 'siti.rahma@email.com'
                      ? 'font-bold text-[#6B1D2F]'
                      : 'text-[#555555]'
                  }`}
                >
                  <span>Siti Rahma (Penerima)</span>
                  {user.email === 'siti.rahma@email.com' && (
                    <span className="text-xs">✓</span>
                  )}
                </button>

                <div className="border-t border-[#E8E2D5] my-1"></div>

                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#333333] hover:bg-[#F9F5EC]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#6B1D2F]">
                    home
                  </span>
                  Halaman Depan
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#C94B45] hover:bg-rose-50 text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 bg-[#6B1D2F] hover:bg-[#501523] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Masuk / Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
