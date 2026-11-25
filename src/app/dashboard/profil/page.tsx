'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function ProfilRedirectPage() {
  const router = useRouter();
  const { user, activeRole, isLoaded } = useApp();

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/login');
      } else {
        router.replace(activeRole === 'PEMOSTING' ? '/profil-penjual' : '/profil-penerima');
      }
    }
  }, [isLoaded, user, activeRole, router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-[#888888]">
      Mengarahkan ke profil...
    </div>
  );
}
