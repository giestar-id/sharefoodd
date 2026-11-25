'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FoodCategory } from '@/types';
import AppNavbar from '@/components/AppNavbar';

function EditMakananContent() {
  const params = useParams();
  const router = useRouter();
  const foodId = params?.id as string;
  const { foods, updateFood } = useApp();

  const food = foods.find((f) => f.id === foodId);

  const [title, setTitle] = useState(food?.title || '');
  const [category, setCategory] = useState<FoodCategory>(
    food?.category || 'makanan_berat'
  );
  const [quantity, setQuantity] = useState(food?.quantity || 1);
  const [unit, setUnit] = useState(food?.unit || 'porsi');
  const [pickupDeadline, setPickupDeadline] = useState(
    food?.pickupDeadline || ''
  );
  const [description, setDescription] = useState(food?.description || '');
  const [storageNotes, setStorageNotes] = useState(food?.storageNotes || '');
  const [areaLabel, setAreaLabel] = useState(food?.areaLabel || '');
  const [fullAddress, setFullAddress] = useState(
    food?.pickupDetails?.fullAddress || ''
  );
  const [landmark, setLandmark] = useState(food?.pickupDetails?.landmark || '');
  const [contactPhone, setContactPhone] = useState(
    food?.pickupDetails?.contactPhone || ''
  );

  // Sync state when food loads from SQLite database
  useEffect(() => {
    if (food) {
      setTitle(food.title);
      setCategory(food.category);
      setQuantity(food.quantity);
      setUnit(food.unit);
      setPickupDeadline(food.pickupDeadline);
      setDescription(food.description);
      setStorageNotes(food.storageNotes);
      setAreaLabel(food.areaLabel);
      if (food.pickupDetails) {
        setFullAddress(food.pickupDetails.fullAddress || '');
        setLandmark(food.pickupDetails.landmark || '');
        setContactPhone(food.pickupDetails.contactPhone || '');
      }
    }
  }, [food]);

  if (!food) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-[#333333]">
          Makanan Tidak Ditemukan
        </h2>
        <Link
          href="/dashboard/makanan-saya"
          className="mt-4 px-4 py-2 bg-[#6B1D2F] text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Makanan Saya
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFood(food.id, {
      title,
      category,
      quantity,
      unit,
      pickupDeadline,
      description,
      storageNotes,
      areaLabel,
      pickupDetails: {
        foodId: food.id,
        fullAddress,
        landmark,
        contactPhone,
      },
    });

    router.push(`/dashboard/makanan-saya/${food.id}`);
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col pb-18 sm:pb-0"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <AppNavbar />

      <div className="py-6 sm:py-10 px-4 flex-1">
        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-[#E8E2D5] shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-[#6B1D2F] text-white flex items-center justify-between">
            <h1 className="font-bold text-base">✏️ Edit Postingan Makanan</h1>
            <Link
              href={`/dashboard/makanan-saya/${food.id}`}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
            >
              Kembali
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-[#333333] block mb-1">
              Nama Makanan
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#333333] block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
              >
                <option value="makanan_berat">Makanan Berat</option>
                <option value="roti_kue">Roti dan Kue</option>
                <option value="buah_sayur">Buah dan Sayur</option>
                <option value="bahan_mentah">Bahan Mentah</option>
                <option value="minuman">Minuman</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#333333] block mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
                />
              </div>
              <div>
                <label className="font-bold text-[#333333] block mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#333333] block mb-1">
              Batas Waktu Pengambilan
            </label>
            <input
              type="text"
              required
              value={pickupDeadline}
              onChange={(e) => setPickupDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
            />
          </div>

          <div>
            <label className="font-bold text-[#333333] block mb-1">
              Deskripsi Makanan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
            />
          </div>

          <div>
            <label className="font-bold text-[#333333] block mb-1">
              Catatan Penyimpanan
            </label>
            <input
              type="text"
              value={storageNotes}
              onChange={(e) => setStorageNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
            />
          </div>

          <div className="pt-2 border-t border-[#E8E2D5] space-y-3">
            <h2 className="font-bold text-xs text-[#6B1D2F]">
              Detail Pengambilan Privat
            </h2>
            <div>
              <label className="font-medium text-[#666666] block mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-[#666666] block mb-1">
                  Patokan
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
                />
              </div>
              <div>
                <label className="font-medium text-[#666666] block mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] text-[#333333]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D5] flex justify-end gap-2">
            <Link
              href={`/dashboard/makanan-saya/${food.id}`}
              className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-xs font-semibold text-[#666666]"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6B1D2F] hover:bg-[#501523] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}

export default function EditMakananPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] p-8 text-center text-xs text-[#888888]">Memuat formulir edit...</div>}>
      <EditMakananContent />
    </Suspense>
  );
}
