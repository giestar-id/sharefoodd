'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

function DetailMakananSayaContent() {
  const params = useParams();
  const router = useRouter();
  const foodId = params?.id as string;
  const {
    foods,
    requests,
    approveRequest,
    declineRequest,
    markAsTaken,
    cancelFood,
    deleteFood,
  } = useApp();

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'approve' | 'decline' | 'markTaken' | 'cancelFood' | 'deleteFood';
    targetId?: string;
    targetName?: string;
  }>({ show: false, type: 'approve' });

  const food = foods.find((f) => f.id === foodId);
  const foodRequests = requests.filter((r) => r.foodId === foodId);
  const approvedReq = foodRequests.find((r) => r.status === 'APPROVED');

  if (!food) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#333333]">Makanan Tidak Ditemukan</h2>
        <Link
          href="/dashboard/makanan-saya"
          className="mt-4 inline-block px-4 py-2 bg-[#6B1D2F] text-white rounded-xl text-sm"
        >
          Kembali ke Makanan Saya
        </Link>
      </div>
    );
  }

  const handleAction = async () => {
    if (confirmModal.type === 'approve' && confirmModal.targetId) {
      await approveRequest(confirmModal.targetId);
    } else if (confirmModal.type === 'decline' && confirmModal.targetId) {
      await declineRequest(confirmModal.targetId);
    } else if (confirmModal.type === 'markTaken') {
      await markAsTaken(food.id);
    } else if (confirmModal.type === 'cancelFood') {
      await cancelFood(food.id);
    } else if (confirmModal.type === 'deleteFood') {
      await deleteFood(food.id);
      router.push('/dashboard/makanan-saya');
    }
    setConfirmModal({ show: false, type: 'approve' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/makanan-saya"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6B1D2F] hover:text-[#4A121F]"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          <span>Kembali ke Makanan Saya</span>
        </Link>

        <div className="flex items-center gap-2">
          {food.status === 'AVAILABLE' && (
            <>
              <Link
                href={`/makanan/${food.id}/edit`}
                className="px-3.5 py-1.5 rounded-xl border border-[#E8E2D5] bg-white text-xs font-semibold text-[#333333] hover:bg-[#F9F5EC]"
              >
                Edit Postingan
              </Link>
              <button
                onClick={() =>
                  setConfirmModal({
                    show: true,
                    type: 'cancelFood',
                    targetName: food.title,
                  })
                }
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-[#C94B45] bg-white text-xs font-semibold hover:bg-rose-50 cursor-pointer"
              >
                Batalkan Postingan
              </button>
            </>
          )}
          {(food.status === 'CANCELLED' || food.status === 'TAKEN') && (
            <button
              onClick={() =>
                setConfirmModal({
                  show: true,
                  type: 'deleteFood',
                  targetName: food.title,
                })
              }
              className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-gray-600 bg-white text-xs font-semibold hover:bg-gray-100 cursor-pointer"
            >
              Hapus Permanen
            </button>
          )}
        </div>
      </div>

      {/* Main Detail Header Card */}
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
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                food.status === 'AVAILABLE'
                  ? 'bg-[#F5EAEB] text-[#6B1D2F] border border-[#6B1D2F]/20'
                  : food.status === 'RESERVED'
                  ? 'bg-amber-100 text-amber-800'
                  : food.status === 'TAKEN'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {food.status}
            </span>
            <span className="text-xs text-[#888888]">
              Dibuat: {food.createdAt}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#333333]">
            {food.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            {food.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E2D5] text-xs">
            <div>
              <span className="text-[#888888] block">Porsi / Kuantitas:</span>
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
              <span className="text-[#888888] block">Perkiraan Area:</span>
              <strong className="text-[#333333]">{food.areaLabel}</strong>
            </div>
            <div>
              <span className="text-[#888888] block">Penyimpanan:</span>
              <strong className="text-[#333333]">{food.storageNotes}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#888888] block">Alergen:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {food.allergens.map((alg, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100] text-[11px] font-semibold"
                  >
                    {alg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Private Pickup Details */}
      <div className="bg-[#F9F5EC] border border-[#E8E2D5] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6B1D2F] text-[20px]">
            lock
          </span>
          <h3 className="font-bold text-sm sm:text-base text-[#6B1D2F]">
            Detail Pengambilan Privat (Hanya Anda & Calon Penerima Disetujui)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-[#E8E2D5]">
          <div>
            <span className="text-[#888888] block font-medium">
              Alamat Lengkap:
            </span>
            <p className="text-[#333333] font-semibold mt-0.5">
              {food.pickupDetails.fullAddress}
            </p>
          </div>
          <div>
            <span className="text-[#888888] block font-medium">Patokan:</span>
            <p className="text-[#333333] font-semibold mt-0.5">
              {food.pickupDetails.landmark}
            </p>
          </div>
          <div>
            <span className="text-[#888888] block font-medium">
              Nomor WhatsApp:
            </span>
            <p className="text-[#6B1D2F] font-semibold mt-0.5">
              {food.pickupDetails.contactPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Mark as Taken Banner if RESERVED */}
      {food.status === 'RESERVED' && approvedReq && (
        <div className="p-5 rounded-2xl bg-[#FDF6F7] border border-[#6B1D2F]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1D2F] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">
                verified
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#6B1D2F]">
                Selesai Serah Terima Makanan?
              </h4>
              <p className="text-xs text-[#6B1D2F]/90">
                Penerima terpilih:{' '}
                <strong>{approvedReq.requesterName}</strong>. Klik tombol berikut
                setelah makanan selesai diambil.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setConfirmModal({
                show: true,
                type: 'markTaken',
                targetName: approvedReq.requesterName,
              })
            }
            className="px-5 py-2.5 rounded-xl bg-[#6B1D2F] hover:bg-[#501523] text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer whitespace-nowrap"
          >
            Tandai Selesai (Mark as Taken)
          </button>
        </div>
      )}

      {/* Requesters Section */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6B1D2F] text-[20px]">
              group
            </span>
            <h3 className="font-bold text-base text-[#333333]">
              Daftar Calon Pengambil ({foodRequests.length})
            </h3>
          </div>
        </div>

        {foodRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888888]">
            Belum ada permintaan masuk untuk makanan ini.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E2D5]">
            {foodRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-[#E8E2D5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={req.requesterAvatar}
                      alt={req.requesterName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#333333]">
                          {req.requesterName}
                        </span>
                        <span className="text-[11px] text-[#888888]">
                          {req.requesterStats}
                        </span>
                      </div>
                      <span className="text-xs text-[#888888]">
                        {req.createdAt}
                      </span>
                    </div>

                    <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E8E2D5] text-xs text-[#333333] leading-relaxed">
                      &quot;{req.message}&quot;
                      <div className="mt-1 text-[#6B1D2F] font-semibold">
                        ⏰ Usulan Waktu Ambil: {req.proposedPickupTime}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {req.status === 'PENDING' && food.status === 'AVAILABLE' ? (
                    <>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            show: true,
                            type: 'decline',
                            targetId: req.id,
                            targetName: req.requesterName,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl border border-[#E8E2D5] text-[#C94B45] hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            show: true,
                            type: 'approve',
                            targetId: req.id,
                            targetName: req.requesterName,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-[#6B1D2F] hover:bg-[#501523] text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          check
                        </span>
                        <span>Setujui (Approve)</span>
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-[#F5EAEB] text-[#6B1D2F] border border-[#6B1D2F]/20'
                          : req.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#E8E2D5]">
            <h3 className="font-bold text-base text-[#333333]">
              {confirmModal.type === 'approve'
                ? 'Konfirmasi Persetujuan'
                : confirmModal.type === 'decline'
                ? 'Konfirmasi Penolakan'
                : confirmModal.type === 'markTaken'
                ? 'Konfirmasi Selesai Diambil'
                : confirmModal.type === 'deleteFood'
                ? 'Hapus Postingan Permanen?'
                : 'Batalkan Postingan?'}
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              {confirmModal.type === 'approve'
                ? `Apakah Anda yakin ingin menyetujui ${confirmModal.targetName}? Sesuai aturan PRD ShareFood, permintaan pending lainnya untuk makanan ini otomatis akan ditolak (DECLINED) dan alamat lengkap Anda akan terbuka untuk penerima.`
                : confirmModal.type === 'decline'
                ? `Tolak permintaan dari ${confirmModal.targetName}? Makanan akan tetap berstatus AVAILABLE untuk pendaftar lain.`
                : confirmModal.type === 'markTaken'
                ? `Tandai makanan ini telah diambil oleh ${confirmModal.targetName}? Transaksi akan masuk ke arsip Riwayat.`
                : confirmModal.type === 'deleteFood'
                ? `Hapus "${confirmModal.targetName}" secara permanen dari database Anda? Tindakan ini tidak dapat diurungkan.`
                : 'Membatalkan postingan akan membatalkan semua permintaan aktif yang masuk.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, type: 'approve' })
                }
                className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-xs font-semibold text-[#666666] hover:bg-[#F9F5EC]"
              >
                Batal
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs ${
                  confirmModal.type === 'approve' ||
                  confirmModal.type === 'markTaken'
                    ? 'bg-[#6B1D2F] hover:bg-[#501523]'
                    : 'bg-[#C94B45] hover:bg-rose-700'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailMakananSayaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#888888]">Memuat detail makanan...</div>}>
      <DetailMakananSayaContent />
    </Suspense>
  );
}
