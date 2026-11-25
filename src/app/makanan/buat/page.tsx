'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MakananBuatRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/post-makanan?tab=post');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-sm text-[#888888]">
      Mengarahkan ke halaman posting makanan...
    </div>
  );
}
