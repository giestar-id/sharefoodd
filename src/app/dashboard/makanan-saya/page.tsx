'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MakananSayaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/post-makanan?tab=kelola');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-[#888888]">
      Mengarahkan ke kelola post...
    </div>
  );
}
