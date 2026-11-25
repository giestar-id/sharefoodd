'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PermintaanMasukRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/post-makanan?tab=permintaan');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-[#888888]">
      Mengarahkan ke pesanan masuk...
    </div>
  );
}
