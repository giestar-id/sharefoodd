'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AppNavbar from '@/components/AppNavbar';

function DetailMakananPublikContent() {
  const params = useParams();
  const router = useRouter();
  const foodId = params?.id as string;
  const { foods, user, requests, requestFood } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [proposedTime, setProposedTime] = useState('Hari ini, 19:00 WIB');
  const [message, setMessage] = useState(
    'Halo, saya ingin mengajukan untuk mengambil makanan ini. Wadah siap bawa sendiri.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const food = foods.find((f) => f.id === foodId);

  if (!food) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-[#333333]">
          Makanan Tidak Ditemukan
        </h2>
        <Link
          href="/makanan"
          className="mt-4 px-4 py-2 bg-[#6B1D2F] text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const isOwn = user?.id === food.userId;
  const existingRequest = requests.find(
    (r) => r.foodId === food.id && r.requesterId === user?.id
  );

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await requestFood(food.id, message, proposedTime);
      setModalOpen(false);
      router.push('/dashboard/makanan-diambil');
    } catch (err: any) {
      alert('Gagal mengirim permohonan ke database: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col pb-18 sm:pb-0" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Universal Top Navbar with Complete Navigation */}
      <AppNavbar />

      {/* Back to Catalog Breadcrumb Link */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
        <Link
          href="/makanan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1D2F] hover:underline"
        >
          <span>← Kembali ke Katalog Makanan</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-8 shadow-xs">
          {/* Left Column: Photos & Dummy Map */}
          <div className="space-y-4">
            <div className="w-full aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-[#E8E2D5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={food.images[0]}
                alt={food.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dummy Map Placeholder as mandated by PRD */}
            <div className="rounded-xl border border-[#E8E2D5] bg-[#F9F5EC] p-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[#6B1D2F] font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">
                  map
                </span>
                <span>Perkiraan Wilayah: {food.areaLabel}</span>
              </div>
              <p className="text-[11px] text-[#888888]">
                Demi keamanan dan privasi, alamat persis dan nomor kontak hanya
                akan terbuka bagi pengambil setelah permintaan disetujui (Approved)
                oleh donatur.
              </p>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#F5EAEB] text-[#6B1D2F] border border-[#6B1D2F]/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {food.status}
                </span>
                <span className="text-xs text-[#888888]">
                  Kategori: {food.category.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#333333]">
                {food.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {food.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E8E2D5] text-xs">
                <div>
                  <span className="text-[#888888] block">Kuantitas:</span>
                  <strong className="text-[#333333]">
                    {food.quantity} {food.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-[#888888] block">Batas Ambil:</span>
                  <strong className="text-[#6B1D2F] font-semibold">
                    {food.pickupDeadline}
                  </strong>
                </div>
                <div>
                  <span className="text-[#888888] block">Waktu Disiapkan:</span>
                  <strong className="text-[#333333]">{food.preparedAt}</strong>
                </div>
                <div>
                  <span className="text-[#888888] block">Penyimpanan:</span>
                  <strong className="text-[#333333]">{food.storageNotes}</strong>
                </div>
              </div>

              {/* Allergens */}
              <div className="pt-2">
                <span className="text-xs text-[#888888] block mb-1">
                  Kandungan Alergen:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {food.allergens.map((alg, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] text-xs font-semibold"
                    >
                      {alg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Owner info card */}
              <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E2D5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6B1D2F] text-white flex items-center justify-center font-bold text-xs">
                  {food.ownerName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#333333] block">
                    Dibagikan oleh {food.ownerName}
                  </span>
                  <span className="text-[11px] text-[#888888]">
                    Warga Terverifikasi Komunitas ShareFood
                  </span>
                </div>
              </div>

              {/* Platform Disclaimer */}
              <p className="text-[11px] text-[#888888] italic">
                * ShareFood memfasilitasi penghubung kerelawanan warga. Silakan
                periksa kondisi fisik dan aroma makanan saat pengambilan mandiri.
              </p>
            </div>

            {/* Bottom Button Matrix according to PRD */}
            <div className="pt-4 border-t border-[#E8E2D5]">
              {isOwn ? (
                <Link
                  href={`/dashboard/makanan-saya/${food.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#6B1D2F] hover:bg-[#4A121F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    settings
                  </span>
                  <span>Kelola Makanan (Milik Sendiri)</span>
                </Link>
              ) : existingRequest ? (
                <Link
                  href={`/dashboard/makanan-diambil/${existingRequest.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    hourglass_top
                  </span>
                  <span>
                    Status Permintaan Anda: {existingRequest.status} (Buka Detail)
                  </span>
                </Link>
              ) : !user ? (
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-[#6B1D2F] hover:bg-[#501523] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    login
                  </span>
                  <span>Masuk Akun untuk Mengambil Makanan</span>
                </Link>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#6B1D2F] hover:bg-[#501523] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    shopping_bag
                  </span>
                  <span>Ajukan Ambil Makanan Ini</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Dialog Ambil Makanan */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#E8E2D5]">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <h3 className="font-bold text-base text-[#333333]">
                Ajukan Pengambilan Makanan
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#333333] block mb-1">
                  Usulan Waktu Jemput
                </label>
                <input
                  type="text"
                  required
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  placeholder="Contoh: Hari ini, 18:30 WIB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
                />
              </div>

              <div>
                <label className="font-bold text-[#333333] block mb-1">
                  Pesan untuk Donatur
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sampaikan untuk siapa makanan ini atau konfirmasi wadah..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
                />
              </div>

              <div className="p-3 bg-[#F5EAEB] border border-[#6B1D2F]/20 rounded-xl text-[11px] text-[#6B1D2F]">
                Permintaan Anda akan berstatus <strong>PENDING</strong> sampai
                disetujui oleh donatur. Alamat lengkap dan WhatsApp akan terbuka
                setelah di-approve.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-xs font-semibold text-[#666666]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#6B1D2F] hover:bg-[#501523] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailMakananPublikPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] p-8 text-center text-xs text-[#888888]">Memuat informasi makanan...</div>}>
      <DetailMakananPublikContent />
    </Suspense>
  );
}
