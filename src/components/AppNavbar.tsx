'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface NavLinkItem {
  title: string;
  href: string;
  active: boolean;
  badge?: number | null;
}

interface MobileNavItem {
  title: string;
  href: string;
  emoji: string;
  active: boolean;
  badge?: number | null;
}

export default function AppNavbar() {
  const pathname = usePathname();
  const { user, activeRole, foods, requests } = useApp();

  // Count pending incoming requests ONLY for current user's foods
  const myFoodIds = new Set(
    foods.filter((f) => f.userId === user?.id || f.ownerName === user?.name).map((f) => f.id)
  );
  const pendingCount = requests.filter((r) => myFoodIds.has(r.foodId) && r.status === 'PENDING').length;

  // When NOT logged in: ZERO navigation links in navbar (100% like hmm/sharefood/index.html)
  // When LOGGED IN: Nav links adapt 100% to activeRole (ambil-makanan.html vs post-makanan.html)
  const pengambilNavLinks: NavLinkItem[] = [
    {
      title: '🎁 Makanan Gratis',
      href: '/ambil-makanan?tab=gratis',
      active: pathname === '/ambil-makanan' || pathname === '/makanan',
    },
    {
      title: '🏷️ Menu Berbayar',
      href: '/ambil-makanan?tab=berbayar',
      active: pathname.includes('tab=berbayar') || pathname.includes('tipe=berbayar'),
    },
    {
      title: '🔔 Notifikasi & Status',
      href: '/ambil-makanan?tab=notifikasi',
      active: pathname.includes('tab=notifikasi') || pathname.startsWith('/dashboard/makanan-diambil'),
    },
    {
      title: '📜 Riwayat',
      href: '/ambil-makanan?tab=riwayat',
      active: pathname.includes('tab=riwayat') || pathname === '/dashboard/riwayat',
    },
    {
      title: '👤 Profil Saya',
      href: '/profil-penerima',
      active: pathname.includes('profil-penerima'),
    },
  ];

  const pemostingNavLinks: NavLinkItem[] = [
    {
      title: '➕ Post & Menu',
      href: '/post-makanan?tab=post',
      active: pathname === '/post-makanan' || pathname === '/makanan/buat',
    },
    {
      title: '🔔 Pesanan Masuk',
      href: '/post-makanan?tab=permintaan',
      active: pathname.includes('tab=permintaan') || pathname === '/dashboard/permintaan-masuk',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      title: '📦 Kelola Post',
      href: '/post-makanan?tab=kelola',
      active: pathname.includes('tab=kelola') || pathname.startsWith('/dashboard/makanan-saya'),
    },
    {
      title: '💰 Transaksi',
      href: '/post-makanan?tab=riwayat-transaksi',
      active: pathname.includes('tab=riwayat-transaksi') || (pathname === '/dashboard/riwayat' && activeRole === 'PEMOSTING'),
    },
    {
      title: '👤 Profil Toko',
      href: '/profil-penjual',
      active: pathname.includes('profil-penjual'),
    },
  ];

  const navLinks: NavLinkItem[] = !user
    ? []
    : activeRole === 'PENGAMBIL'
    ? pengambilNavLinks
    : pemostingNavLinks;

  // Mobile bottom bar items (Exact 1:1 from hmm/sharefood/style.css .mobile-nav)
  const pengambilMobileNavItems: MobileNavItem[] = [
    {
      title: 'Gratis',
      href: '/ambil-makanan?tab=gratis',
      emoji: '🎁',
      active: pathname === '/ambil-makanan' || pathname === '/makanan',
    },
    {
      title: 'Berbayar',
      href: '/ambil-makanan?tab=berbayar',
      emoji: '🏷️',
      active: pathname.includes('tab=berbayar') || pathname.includes('tipe=berbayar'),
    },
    {
      title: 'Status',
      href: '/ambil-makanan?tab=notifikasi',
      emoji: '🔔',
      active: pathname.includes('tab=notifikasi') || pathname.startsWith('/dashboard/makanan-diambil'),
    },
    {
      title: 'Riwayat',
      href: '/ambil-makanan?tab=riwayat',
      emoji: '📜',
      active: pathname.includes('tab=riwayat') || pathname === '/dashboard/riwayat',
    },
    {
      title: 'Profil',
      href: '/profil-penerima',
      emoji: '👤',
      active: pathname.includes('profil-penerima'),
    },
  ];

  const pemostingMobileNavItems: MobileNavItem[] = [
    {
      title: 'Post',
      href: '/post-makanan?tab=post',
      emoji: '➕',
      active: pathname === '/post-makanan' || pathname === '/makanan/buat',
    },
    {
      title: 'Pesanan',
      href: '/post-makanan?tab=permintaan',
      emoji: '🔔',
      active: pathname.includes('tab=permintaan') || pathname === '/dashboard/permintaan-masuk',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      title: 'Kelola',
      href: '/post-makanan?tab=kelola',
      emoji: '📦',
      active: pathname.includes('tab=kelola') || pathname.startsWith('/dashboard/makanan-saya'),
    },
    {
      title: 'Omzet',
      href: '/post-makanan?tab=riwayat-transaksi',
      emoji: '💰',
      active: pathname.includes('tab=riwayat-transaksi') || (pathname === '/dashboard/riwayat' && activeRole === 'PEMOSTING'),
    },
    {
      title: 'Profil',
      href: '/profil-penjual',
      emoji: '👤',
      active: pathname.includes('profil-penjual'),
    },
  ];

  const mobileNavItems: MobileNavItem[] = !user
    ? []
    : activeRole === 'PENGAMBIL'
    ? pengambilMobileNavItems
    : pemostingMobileNavItems;

  return (
    <>
      <style jsx global>{`
        /* EXACT TOP NAVBAR STYLES FROM hmm/sharefood/style.css */
        .universal-navbar {
          background-color: #6B1D2F;
          color: #FFFFFF;
          padding: 0.8rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .universal-logo {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #F9F5EC;
          text-decoration: none;
        }

        .universal-nav-links {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .universal-nav-btn {
          background: none;
          border: none;
          color: #FFFFFF;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.45rem 0.85rem;
          cursor: pointer;
          border-radius: 4px;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }

        .universal-nav-btn:hover,
        .universal-nav-btn.active {
          background-color: rgba(255, 255, 255, 0.18);
          color: #FFFFFF;
        }

        .universal-btn-green {
          background-color: #2E7D32;
          color: #FFFFFF;
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.1s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }

        .universal-btn-green:hover {
          background-color: #246B27;
        }

        .universal-btn-green:active {
          transform: scale(0.98);
        }

        /* MOBILE BOTTOM NAVIGATION BAR */
        .universal-mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: #6B1D2F;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 1000;
          justify-content: space-around;
          padding: 0.4rem 0;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .universal-mobile-nav-btn {
          background: none;
          border: none;
          color: #F9F5EC;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          opacity: 0.75;
          text-decoration: none;
          position: relative;
          padding: 0.2rem 0.5rem;
        }

        .universal-mobile-nav-btn span {
          font-size: 1.25rem;
          margin-bottom: 0.1rem;
        }

        .universal-mobile-nav-btn:hover,
        .universal-mobile-nav-btn.active {
          opacity: 1;
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }

        @media (max-width: 600px) {
          .universal-nav-links {
            display: none !important;
          }
          .universal-mobile-nav {
            display: flex;
          }
        }
      `}</style>

      {/* TOP NAVBAR (Exact hmm/sharefood layout: Logo on Left, All Menus Grouped on Right) */}
      <nav className="universal-navbar">
        {/* Brand Logo */}
        <Link href="/" className="universal-logo">
          ShareFood
        </Link>

        {/* SPECIAL NAVBAR FOR PROFIL PAGE (Exact 1:1 hmm/sharefood profil-penerima.html & profil-penjual.html) */}
        {pathname.includes('profil') ? (
          <div className="nav-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link
              href={activeRole === 'PENGAMBIL' ? '/ambil-makanan' : '/post-makanan'}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#FFFFFF',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s ease',
              }}
            >
              Kembali
            </Link>
            <Link
              href="/role-select"
              style={{
                backgroundColor: '#E65100',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#FFFFFF',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s ease',
              }}
            >
              🔄 Ganti Role
            </Link>
          </div>
        ) : (
          /* All Navigation Links Grouped on Far-Right (100% hmm/sharefood - NO extra dropdown/duplicate) */
          <div className="universal-nav-links">
            {user ? (
              navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`universal-nav-btn ${item.active ? 'active' : ''}`}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="bg-[#D32F2F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <Link
                href="/login"
                className="universal-btn-green"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR (Exact hmm/sharefood .mobile-nav - Only for Logged In Users, Hidden on Profile) */}
      {user && !pathname.includes('profil') && mobileNavItems.length > 0 && (
        <nav className="universal-mobile-nav">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`universal-mobile-nav-btn ${item.active ? 'active' : ''}`}
            >
              <span>{item.emoji}</span>
              <div>{item.title}</div>
              {item.badge && (
                <span className="absolute top-0.5 right-1.5 bg-[#E65100] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
