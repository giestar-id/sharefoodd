'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function RiwayatRedirect() {
  const router = useRouter();
  const { activeRole } = useApp();

  useEffect(() => {
    if (activeRole === 'PEMOSTING') {
      router.replace('/post-makanan?tab=riwayat-transaksi');
    } else {
      router.replace('/ambil-makanan?tab=riwayat');
    }
  }, [activeRole, router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-[#888888]">
      Mengarahkan ke riwayat transaksi...
    </div>
  );
}
