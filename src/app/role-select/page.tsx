'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function RoleSelectPage() {
  const router = useRouter();
  const { user, activeRole, isLoaded, setActiveRole } = useApp();

  // Protect route: must be logged in to select role
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  const handleSelectRole = (role: 'PENGAMBIL' | 'PEMOSTING') => {
    setActiveRole(role);
    if (role === 'PENGAMBIL') {
      router.push('/ambil-makanan');
    } else {
      router.push('/post-makanan');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#333333]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <style jsx global>{`
        /* EXACT STYLES FROM hmm/sharefood/role-select.html */
        .role-navbar {
          background-color: #6B1D2F;
          color: #FFFFFF;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .role-logo {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #F9F5EC;
          text-decoration: none;
        }

        .role-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
        }

        .role-box {
          max-width: 650px;
          width: 100%;
          text-align: center;
        }

        .role-title {
          color: #6B1D2F;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .role-subtitle {
          color: #666666;
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .role-card {
          background-color: #FFFFFF;
          border: 2px solid #E8E2D5;
          border-radius: 10px;
          padding: 2rem 1.5rem;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }

        .role-card:hover {
          transform: translateY(-4px);
          border-color: #6B1D2F;
          box-shadow: 0 6px 16px rgba(107, 29, 47, 0.12);
        }

        .role-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .role-card h3 {
          color: #6B1D2F;
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .role-card p {
          color: #666666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .role-btn {
          display: inline-block;
          width: 100%;
          padding: 0.65rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }

        .role-btn-green {
          background-color: #2E7D32;
          color: #FFFFFF;
        }

        .role-btn-green:hover {
          background-color: #246B27;
        }

        .role-footer {
          background-color: #6B1D2F;
          color: #F9F5EC;
          text-align: center;
          padding: 1.25rem;
          font-size: 0.875rem;
          margin-top: auto;
        }

        @media (max-width: 500px) {
          .role-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="role-navbar">
        <Link href="/" className="role-logo">
          ShareFood
        </Link>
        {user && (
          <Link
            href={activeRole === 'PEMOSTING' ? '/profil-penjual' : '/profil-penerima'}
            className="text-sm font-semibold text-[#F9F5EC] hover:bg-white/15 px-3 py-1.5 rounded transition-colors"
            style={{ textDecoration: 'none' }}
          >
            👤 Profile
          </Link>
        )}
      </nav>

      {/* SELEKSI ROLE */}
      <main className="role-wrapper">
        <div className="role-box">
          <h2 className="role-title">Pilih Role Anda</h2>
          <p className="role-subtitle">
            Silakan pilih aktivitas yang ingin Anda lakukan saat ini
          </p>

          <div className="role-grid">
            {/* Role 1: Ambil / Beli Makanan */}
            <div
              onClick={() => handleSelectRole('PENGAMBIL')}
              className="role-card"
              role="button"
              tabIndex={0}
            >
              <div>
                <div className="role-icon">🍲</div>
                <h3>Ambil / Beli Makanan</h3>
                <p>
                  Cari makanan gratis atau beli makanan terjangkau berdasarkan
                  radius lokasi Anda.
                </p>
              </div>
              <span className="role-btn role-btn-green">
                Masuk sebagai Pengambil
              </span>
            </div>

            {/* Role 2: Post Makanan */}
            <div
              onClick={() => handleSelectRole('PEMOSTING')}
              className="role-card"
              role="button"
              tabIndex={0}
            >
              <div>
                <div className="role-icon">📢</div>
                <h3>Post Makanan</h3>
                <p>
                  Bagikan makanan sisa gratis atau jual makanan dengan
                  menentukan nominal harga.
                </p>
              </div>
              <span className="role-btn role-btn-green">
                Masuk sebagai Pemosting
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="role-footer">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}
