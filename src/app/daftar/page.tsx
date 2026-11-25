'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DaftarPage() {
  const router = useRouter();
  const { login } = useApp();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !email || !password) {
      alert('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login(email.trim());
      if (success) {
        alert('Pendaftaran berhasil! Mengarahkan ke pemilihan role...');
        router.push('/role-select');
      } else {
        alert('Pendaftaran berhasil! Silakan masuk.');
        router.push('/login');
      }
    } catch (err: any) {
      alert('Gagal mendaftar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#333333]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <style jsx global>{`
        /* EXACT STYLES FROM hmm/sharefood/daftar.html */
        .daftar-navbar {
          background-color: #6B1D2F;
          color: #FFFFFF;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .daftar-logo {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #F9F5EC;
          text-decoration: none;
        }

        .auth-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        .auth-card {
          background-color: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
          padding: 2rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .auth-header h2 {
          color: #6B1D2F;
          font-size: 1.6rem;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .auth-header p {
          color: #666666;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.15rem;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333333;
          margin-bottom: 0.4rem;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.95rem;
          border: 1px solid #CCCCCC;
          border-radius: 6px;
          background-color: #FFFFFF;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .form-control:focus {
          border-color: #6B1D2F;
        }

        .btn {
          display: inline-block;
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          transition: background-color 0.2s ease, transform 0.1s ease;
          margin-top: 0.5rem;
        }

        .btn:active {
          transform: scale(0.98);
        }

        .btn-green {
          background-color: #2E7D32;
          color: #FFFFFF;
        }

        .btn-green:hover {
          background-color: #246B27;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #666666;
        }

        .auth-footer a {
          color: #6B1D2F;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-footer a:hover {
          text-decoration: underline;
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
      <nav className="daftar-navbar">
        <Link href="/" className="daftar-logo">
          ShareFood
        </Link>
      </nav>

      {/* FORM DAFTAR CONTAINER */}
      <main className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Buat Akun Baru</h2>
            <p>Bergabunglah dengan komunitas ShareFood</p>
          </div>

          <form id="form-daftar" onSubmit={handleDaftar}>
            <div className="form-group">
              <label htmlFor="nama">Nama Lengkap</label>
              <input
                type="text"
                id="nama"
                className="form-control"
                placeholder="Nama lengkap Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">Nomor WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                className="form-control"
                placeholder="081234567890"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Kata Sandi</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-green">
              {isSubmitting ? 'Mendaftarkan...' : 'Daftar Akun'}
            </button>
          </form>

          <div className="auth-footer">
            Sudah punya akun? <Link href="/login">Masuk di sini</Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}
