'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AppNavbar from '@/components/AppNavbar';

export default function ProfilPenjualPage() {
  const router = useRouter();
  const { user, setActiveRole, logout, isLoaded } = useApp();

  useEffect(() => {
    setActiveRole('PEMOSTING');
  }, [setActiveRole]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  const handleLogout = async () => {
    await logout();
    alert('Anda berhasil keluar.');
    router.push('/login');
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#333333]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <style jsx global>{`
        /* EXACT STYLES FROM hmm/sharefood/profil-penjual.html */
        .profile-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2.5rem 1rem;
        }

        .profile-card {
          background-color: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 12px;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .profile-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .profile-avatar {
          width: 70px;
          height: 70px;
          background-color: #FFF3E0;
          color: #E65100;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          margin: 0 auto 1rem auto;
          border: 2px solid #FFE0B2;
        }

        .profile-header h2 {
          color: #6B1D2F;
          font-size: 1.5rem;
          margin-bottom: 4px;
          font-weight: 700;
        }

        .badge-role {
          display: inline-block;
          background-color: #FFF3E0;
          color: #E65100;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          margin-top: 6px;
        }

        .info-group {
          margin-bottom: 1.25rem;
          border-bottom: 1px solid #F0F0F0;
          padding-bottom: 0.75rem;
          text-align: left;
        }

        .info-group label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .info-group p {
          font-size: 1.05rem;
          font-weight: 600;
          color: #2C3E50;
          word-break: break-word;
        }

        .btn-logout {
          margin-top: 1.75rem;
          display: block;
          width: 100%;
          padding: 0.85rem;
          background-color: #D32F2F;
          color: #FFFFFF;
          text-align: center;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-logout:hover {
          background-color: #B71C1C;
        }

        .footer {
          background-color: #6B1D2F;
          color: #F9F5EC;
          text-align: center;
          padding: 1.25rem;
          font-size: 0.875rem;
          margin-top: auto;
        }
      `}</style>

      {/* NAVBAR */}
      <AppNavbar />

      {/* KONTEN PROFIL */}
      <main className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">🏪</div>
            <h2>Profil Toko / Donatur</h2>
            <span className="badge-role">Role: Pemosting Makanan</span>
          </div>

          <div className="info-group">
            <label>Nama Pemilik / Toko</label>
            <p id="profile-nama">{user?.name || '-'}</p>
          </div>

          <div className="info-group">
            <label>Alamat Email</label>
            <p id="profile-email">{user?.email || '-'}</p>
          </div>

          <div className="info-group">
            <label>Nomor WhatsApp Kontak</label>
            <p id="profile-whatsapp">{user?.phone || '0812-3456-7890'}</p>
          </div>

          <button onClick={handleLogout} className="btn-logout">
            Keluar Akun (Logout)
          </button>
        </div>
      </main>

      <footer className="footer">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}
