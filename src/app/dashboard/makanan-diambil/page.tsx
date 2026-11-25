'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MakananDiambilRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ambil-makanan?tab=notifikasi');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-[#888888]">
      Mengarahkan ke status pesanan...
    </div>
  );
}
