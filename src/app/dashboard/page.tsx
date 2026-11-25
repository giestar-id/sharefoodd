'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function DashboardRingkasan() {
  const { user, activeRole, setActiveRole, foods, requests, activities } = useApp();

  // Metrics
  const myFoods = foods.filter((f) => f.userId === user?.id);
  const activePostings = myFoods.filter((f) => f.status === 'AVAILABLE').length;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activePickups = requests.filter(
    (r) => r.requesterId === user?.id && r.status === 'APPROVED'
  ).length;
  const totalCompleted = (user?.sharedCount || 0) + (user?.receivedCount || 0);

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* 1. Alert Banner Permintaan Masuk (Pending) - Khas Notifikasi hmm/sharefood */}
      {pendingRequests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-lg bg-[#FFF3E0] border border-[#FFE082] shadow-xs transition-all">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl shrink-0">🔔</span>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#E65100]">
                Ada {pendingRequests.length} pesanan/permintaan masuk menunggu keputusan Anda!
              </h2>
              <p className="text-xs text-[#795548] mt-0.5">
                Segera konfirmasi calon penerima sebelum batas waktu makanan terlewati.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/permintaan-masuk"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#E65100] hover:bg-[#BF360C] text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shadow-xs shrink-0"
          >
            <span>Tinjau Pesanan</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* 2. Dual-Intent Entry Cards - Khas role-select.html (🍲 Ambil & 📢 Post) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Role: Pemosting Makanan */}
        <div className="rounded-lg bg-white border border-[#E8E2D5] p-6 shadow-xs hover:border-[#6B1D2F] transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📢</span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E3F2FD] text-[#1565C0] px-2.5 py-1 rounded-md">
                Pemosting
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#6B1D2F] mt-1">
                Post / Bagikan Makanan
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mt-1">
                Bagikan makanan berlebih layak konsumsi dari rumah atau usaha secara gratis atau terjangkau untuk membantu sesama warga.
              </p>
            </div>
          </div>
          <div className="pt-5 mt-2">
            <Link
              href="/makanan/buat"
              onClick={() => setActiveRole('PEMOSTING')}
              className="inline-flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#246B27] text-white px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>➕</span>
              <span>Posting Makanan Baru</span>
            </Link>
          </div>
        </div>

        {/* Role: Pengambil Makanan */}
        <div className="rounded-lg bg-white border border-[#E8E2D5] p-6 shadow-xs hover:border-[#6B1D2F] transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🍲</span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-md">
                Pengambil
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#6B1D2F] mt-1">
                Ambil / Cari Makanan
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mt-1">
                Jelajahi sajian makanan surplus siap ambil di sekitar radius lokasi Anda hari ini secara sukarela, halal, dan higienis.
              </p>
            </div>
          </div>
          <div className="pt-5 mt-2">
            <Link
              href="/makanan"
              onClick={() => setActiveRole('PENGAMBIL')}
              className="inline-flex items-center justify-center gap-2 bg-[#6B1D2F] hover:bg-[#521524] text-white px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>🔍</span>
              <span>Cari Makanan di Sekitar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Empat Stat Cards Khas style.css (.stat-card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1 */}
        <div className="p-4 rounded-lg bg-[#F9F5EC] border border-[#E8E2D5] text-center flex flex-col justify-between shadow-xs">
          <h4 className="text-xs font-semibold text-[#666666] mb-1">
            📦 Postingan Aktif
          </h4>
          <div className="text-2xl sm:text-3xl font-bold text-[#6B1D2F] my-1">
            {activePostings}
          </div>
          <span className="text-[11px] text-[#666666]">
            Tayang di katalog
          </span>
        </div>

        {/* Stat 2 */}
        <div className="p-4 rounded-lg bg-[#FFF3E0] border border-[#FFE082] text-center flex flex-col justify-between shadow-xs">
          <h4 className="text-xs font-semibold text-[#E65100] mb-1">
            🔔 Pesanan Masuk
          </h4>
          <div className="text-2xl sm:text-3xl font-bold text-[#E65100] my-1">
            {pendingRequests.length}
          </div>
          <span className="text-[11px] text-[#795548]">
            Perlu konfirmasi
          </span>
        </div>

        {/* Stat 3 */}
        <div className="p-4 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-center flex flex-col justify-between shadow-xs">
          <h4 className="text-xs font-semibold text-[#2E7D32] mb-1">
            🎁 Pengambilan Aktif
          </h4>
          <div className="text-2xl sm:text-3xl font-bold text-[#2E7D32] my-1">
            {activePickups}
          </div>
          <span className="text-[11px] text-[#2E7D32]">
            Disetujui donatur
          </span>
        </div>

        {/* Stat 4 */}
        <div className="p-4 rounded-lg bg-[#F9F5EC] border border-[#E8E2D5] text-center flex flex-col justify-between shadow-xs">
          <h4 className="text-xs font-semibold text-[#666666] mb-1">
            📜 Total Selesai
          </h4>
          <div className="text-2xl sm:text-3xl font-bold text-[#6B1D2F] my-1">
            {totalCompleted}
          </div>
          <span className="text-[11px] text-[#666666]">
            Transaksi terselesaikan
          </span>
        </div>
      </div>

      {/* 4. Tabel Aktivitas Terbaru Khas hmm/sharefood */}
      <div className="rounded-lg bg-white border border-[#E8E2D5] shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D5] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <h3 className="font-bold text-base text-[#6B1D2F]">
              Aktivitas Transaksi Terbaru
            </h3>
          </div>
          <Link
            href="/dashboard/riwayat"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#6B1D2F] hover:underline transition-colors"
          >
            <span>Buka Semua Riwayat</span>
            <span>→</span>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F9F5EC] text-[#666666] text-xs uppercase tracking-wider font-semibold border-b border-[#E8E2D5]">
                <th className="py-3 px-5">Tipe</th>
                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {activities.slice(0, 5).map((act) => (
                <tr
                  key={act.id}
                  className="hover:bg-[#FDFBF7] transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                      {act.type === 'posted' && (
                        <span className="text-[#2E7D32]">➕ Posting</span>
                      )}
                      {act.type === 'request_in' && (
                        <span className="text-[#E65100]">🔔 Permintaan</span>
                      )}
                      {act.type === 'approved' && (
                        <span className="text-[#2E7D32]">✅ Disetujui</span>
                      )}
                      {act.type === 'declined' && (
                        <span className="text-[#C62828]">❌ Ditolak</span>
                      )}
                      {act.type === 'taken' && (
                        <span className="text-[#6B1D2F]">🎉 Selesai</span>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#333333]">
                    {act.description}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#666666] whitespace-nowrap">
                    {act.timestamp}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                        ['AVAILABLE', 'APPROVED', 'COMPLETED'].includes(act.status)
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : ['PENDING'].includes(act.status)
                          ? 'bg-[#FFF3E0] text-[#E65100]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {act.targetUrl ? (
                      <Link
                        href={act.targetUrl}
                        className="text-xs font-semibold text-[#6B1D2F] hover:underline"
                      >
                        Buka →
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-[#E8E2D5]">
          {activities.slice(0, 4).map((act) => (
            <div key={act.id} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6B1D2F]">{act.title}</span>
                <span className="text-gray-500">{act.timestamp}</span>
              </div>
              <p className="text-xs text-gray-700">{act.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
