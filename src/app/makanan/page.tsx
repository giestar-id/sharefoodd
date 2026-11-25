'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MakananRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tipe = searchParams.get('tipe');
    if (tipe === 'berbayar') {
      router.replace('/ambil-makanan?tab=berbayar');
    } else {
      router.replace('/ambil-makanan?tab=gratis');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-sm text-[#888888]">
      Mengarahkan ke katalog makanan...
    </div>
  );
}

export default function MakananRedirect() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#888888]">Memuat...</div>}>
      <MakananRedirectContent />
    </Suspense>
  );
}
