'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

function DetailMakananDiambilContent() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id as string;
  const { requests, foods, cancelRequest } = useApp();
  const [cancelModal, setCancelModal] = useState(false);

  const req = requests.find((r) => r.id === requestId);
  const food = req ? foods.find((f) => f.id === req.foodId) : null;

  if (!req || !food) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#333333]">
          Permintaan Tidak Ditemukan
        </h2>
        <Link
          href="/dashboard/makanan-diambil"
          className="mt-4 inline-block px-4 py-2 bg-[#6B1D2F] text-white rounded-xl text-sm"
        >
          Kembali ke Makanan Diambil
        </Link>
      </div>
    );
  }

  const isApproved = req.status === 'APPROVED';

  const handleCancel = async () => {
    await cancelRequest(req.id);
    setCancelModal(false);
    router.push('/dashboard/makanan-diambil');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/makanan-diambil"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6B1D2F] hover:text-[#4A121F]"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          <span>Kembali ke Makanan Diambil</span>
        </Link>

        {(req.status === 'PENDING' || req.status === 'APPROVED') && (
          <button
            onClick={() => setCancelModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-[#C94B45] hover:bg-rose-50 text-xs font-semibold cursor-pointer"
          >
            Batalkan Permintaan
          </button>
        )}
      </div>

      {/* PRIVACY HIGHLIGHT: Top Maroon/Rose Approved Box (Only shown if APPROVED) */}
      {isApproved && (
        <div className="bg-[#FDF6F7] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border border-[#6B1D2F]/30 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#6B1D2F] flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">
                verified
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base sm:text-lg text-[#6B1D2F] font-bold">
                Permintaan Anda Disetujui!
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                Detail kontak dan alamat lengkap donatur telah dibuka secara aman
                khusus untuk Anda. Silakan hubungi via WhatsApp untuk konfirmasi penjemputan.
              </p>
            </div>
          </div>

          {/* Pickup Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#6B1D2F]/20 text-xs">
            <div className="space-y-1">
              <span className="text-[#666666] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#6B1D2F]">
                  pin_drop
                </span>
                Alamat Lengkap
              </span>
              <p className="text-[#333333] font-bold leading-snug">
                {food.pickupDetails.fullAddress}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#666666] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#6B1D2F]">
                  signpost
                </span>
                Patokan Lokasi
              </span>
              <p className="text-[#333333] font-bold leading-snug">
                {food.pickupDetails.landmark}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#666666] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#6B1D2F]">
                  call
                </span>
                Kontak Pemberi
              </span>
              <p className="text-[#6B1D2F] font-bold leading-snug">
                {food.pickupDetails.contactPhone}
              </p>
              <a
                href={`https://wa.me/${food.pickupDetails.contactPhone.replace(
                  /[^0-9]/g,
                  ''
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6B1D2F] hover:bg-[#501523] text-white font-semibold shadow-xs"
              >
                <span>Hubungi via WhatsApp</span>
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Food Summary Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 h-52 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-[#E8E2D5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={food.images[0]}
            alt={food.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                req.status === 'APPROVED'
                  ? 'bg-[#F5EAEB] text-[#6B1D2F] border border-[#6B1D2F]/20'
                  : req.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Status Permintaan: {req.status}
            </span>
            <span className="text-xs text-[#888888]">Oleh: {food.ownerName}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#333333]">
            {food.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            {food.description}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8E2D5] text-xs">
            <div>
              <span className="text-[#888888] block">Batas Waktu Ambil:</span>
              <strong className="text-[#6B1D2F] font-semibold">
                {food.pickupDeadline}
              </strong>
            </div>
            <div>
              <span className="text-[#888888] block">Usulan Anda:</span>
              <strong className="text-[#6B1D2F] font-semibold">
                {req.proposedPickupTime}
              </strong>
            </div>
          </div>

          <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E8E2D5] text-xs text-[#555555]">
            <span className="font-semibold block text-[#333333] mb-0.5">
              Pesan yang Anda Kirim:
            </span>
            &quot;{req.message}&quot;
          </div>
        </div>
      </div>

      {/* Cancellation Dialog */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#E8E2D5]">
            <h3 className="font-bold text-base text-[#333333]">
              Batalkan Pengambilan Makanan?
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Jika Anda berhalangan menjemput makanan ini, membatalkan permintaan
              akan mengembalikan status makanan menjadi AVAILABLE agar dapat dimanfaatkan oleh warga lain yang membutuhkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-xs font-semibold text-[#666666] hover:bg-[#F9F5EC]"
              >
                Kembali
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#C94B45] hover:bg-rose-700 shadow-xs"
              >
                Ya, Batalkan Permintaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailMakananDiambilPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#888888]">Memuat detail pengambilan...</div>}>
      <DetailMakananDiambilContent />
    </Suspense>
  );
}
