'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import AppNavbar from '@/components/AppNavbar';

export default function LandingPage() {
  const { user } = useApp();

  return (
    <div className="landing-wrapper">
      <style jsx global>{`
        /* EXACT 1:1 STYLES FROM hmm/sharefood/index.html & style.css */
        .landing-wrapper {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #FDFBF7;
          color: #333333;
          line-height: 1.6;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding-bottom: 70px;
        }

        @media (min-width: 601px) {
          .landing-wrapper {
            padding-bottom: 0;
          }
        }

        /* HERO SECTION */
        .landing-hero {
          background-color: #F9F5EC;
          text-align: center;
          padding: 4rem 1.5rem;
          border-bottom: 1px solid #E8E2D5;
        }

        .landing-hero h1 {
          color: #6B1D2F;
          font-size: 2.2rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .landing-hero p {
          color: #555555;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 2rem auto;
        }

        /* BUTTONS */
        .landing-btn {
          display: inline-block;
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .landing-btn:active {
          transform: scale(0.98);
        }

        .landing-btn-green {
          background-color: #2E7D32;
          color: #FFFFFF;
        }

        .landing-btn-green:hover {
          background-color: #246B27;
        }

        /* SERVICES SECTION */
        .landing-container {
          max-width: 1000px;
          margin: 3rem auto;
          padding: 0 1.5rem;
          flex: 1;
          width: 100%;
        }

        .landing-section-title {
          text-align: center;
          color: #6B1D2F;
          font-size: 1.6rem;
          margin-bottom: 2rem;
          font-weight: 700;
        }

        .landing-services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .landing-card {
          background-color: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
          padding: 1.75rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .landing-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .landing-card-badge {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }

        .landing-badge-free {
          background-color: #E8F5E9;
          color: #2E7D32;
        }

        .landing-badge-paid {
          background-color: #FFF3E0;
          color: #E65100;
        }

        .landing-card h3 {
          color: #333333;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .landing-card p {
          color: #666666;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* FOOTER */
        .landing-footer {
          background-color: #6B1D2F;
          color: #F9F5EC;
          text-align: center;
          padding: 1.25rem;
          font-size: 0.875rem;
          margin-top: auto;
        }

        /* RESPONSIVE */
        @media (max-width: 600px) {
          .landing-hero h1 {
            font-size: 1.75rem;
          }
          .landing-btn {
            display: block;
            width: 100%;
            margin: 0.5rem 0;
          }
        }
      `}</style>

      {/* UNIVERSAL NAVBAR WITH ALL NAVIGATION LINKS */}
      <AppNavbar />

      {/* HERO SECTION */}
      <section className="landing-hero">
        <h1>Solusi Berbagi & Menikmati Makanan Sekitar</h1>
        <p>
          Platform simpel untuk membagikan makanan sisa layak konsumsi secara
          gratis atau menjualnya dengan harga terjangkau.
        </p>
        <div>
          <Link
            href={user ? '/role-select' : '/login'}
            className="landing-btn landing-btn-green"
          >
            {user ? 'Buka Aplikasi (Pilih Role)' : 'Mulai Sekarang'}
          </Link>
        </div>
      </section>

      {/* LAYANAN UTAMA */}
      <main className="landing-container">
        <h2 className="landing-section-title">Layanan Utama</h2>
        <div className="landing-services-grid">
          {/* Kartu 1: Ambil Makanan Gratis */}
          <Link
            href={user ? '/makanan' : '/login'}
            className="landing-card block transition-transform hover:-translate-y-1 hover:border-[#6B1D2F]"
          >
            <span className="landing-card-badge landing-badge-free">Gratis</span>
            <h3>Ambil Makanan Sisa</h3>
            <p>
              Cari makanan layak konsumsi di sekitar radius lokasi Anda yang
              dibagikan secara gratis oleh sesama pengguna atau toko.
            </p>
          </Link>

          {/* Kartu 2: Beli Makanan Hemat */}
          <Link
            href={user ? '/makanan?tipe=berbayar' : '/login'}
            className="landing-card block transition-transform hover:-translate-y-1 hover:border-[#6B1D2F]"
          >
            <span className="landing-card-badge landing-badge-paid">
              Berbayar
            </span>
            <h3>Beli Makanan Terjangkau</h3>
            <p>
              Temukan penawaran makanan dari toko atau resto sekitar dengan harga
              hemat sebelum batas waktu operasional habis.
            </p>
          </Link>

          {/* Kartu 3: Post Makanan */}
          <Link
            href={user ? '/makanan/buat' : '/login'}
            className="landing-card block transition-transform hover:-translate-y-1 hover:border-[#6B1D2F]"
          >
            <span
              className="landing-card-badge"
              style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
            >
              Pemosting
            </span>
            <h3>Bagikan / Jual Makanan</h3>
            <p>
              Upload makanan yang ingin Anda bagikan gratis atau jual, atur
              lokasi via Maps, dan terima permintaan langsung lewat WhatsApp.
            </p>
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="landing-footer">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}
