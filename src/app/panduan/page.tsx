import React from 'react';
import Link from 'next/link';
import AppNavbar from '@/components/AppNavbar';

export default function PanduanPage() {
  const guidelines = [
    {
      icon: 'lightbulb',
      title: '1. Bertemu di Tempat Terang & Aman',
      desc: 'Lakukan serah terima makanan di tempat yang mudah dijangkau, terang, dan tidak sepi. Titik penjemputan umum seperti depan pos sekuriti, lobi, atau teras depan rumah sangat disarankan.',
    },
    {
      icon: 'verified',
      title: '2. Periksa Kondisi & Aroma Makanan',
      desc: 'Saat penjemputan mandiri, periksa secara visual kelayakan makanan, tekstur, dan aromanya. Jika kondisi dirasa meragukan atau tidak segar, jangan ragu untuk menolak dengan santun.',
    },
    {
      icon: 'no_food',
      title: '3. Perhatikan Alergen & Suhu Simpan',
      desc: 'Pengambil wajib membaca daftar alergen (kacang, susu, gluten, seafood, dsb) pada rincian makanan. Segera konsumsi atau panaskan kembali sesuai anjuran penyimpanan donatur.',
    },
    {
      icon: 'lock',
      title: '4. Privasi Berlapis & Perlindungan Data',
      desc: 'Alamat lengkap dan nomor telepon Anda terlindungi secara sistemik dan hanya dapat diakses oleh pihak yang telah disetujui (Approved). Jangan membagikan data sensitif di luar kebutuhan penjemputan.',
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col pb-18 sm:pb-0"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* Universal Top Navbar with All Navigation Links */}
      <AppNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        <div className="text-center space-y-2 py-4">
          <span className="px-3 py-1 bg-rose-100 text-[#6B1D2F] rounded-full text-xs font-bold uppercase tracking-wider">
            Edukasi & Keselamatan
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">
            Panduan Keamanan Komunitas ShareFood
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto">
            Pedoman bersama untuk memastikan serah terima makanan surplus berlangsung aman, higienis, dan nyaman bagi semua pihak.
          </p>
        </div>

        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {guidelines.map((g, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5EAEB] text-[#6B1D2F] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{g.icon}</span>
              </div>
              <h2 className="font-bold text-base text-[#333333]">{g.title}</h2>
              <p className="text-xs text-[#666666] leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* Reporting Contact Box */}
        <div className="bg-[#F9F5EC] border border-[#E8E2D5] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <h3 className="font-bold text-sm sm:text-base text-[#6B1D2F]">
              Menemukan Postingan Bermasalah?
            </h3>
            <p className="text-xs text-[#666666]">
              Jika Anda menemukan sajian yang tidak layak atau pelanggaran aturan komunitas, laporkan segera ke tim pengelola kami via email:
            </p>
            <p className="text-xs font-bold text-[#333333]">
              📧 pengelola@sharefood.id | 💬 WhatsApp Hotline: 0812-9999-8888
            </p>
          </div>

          <a
            href="mailto:pengelola@sharefood.id"
            className="px-5 py-2.5 rounded-xl bg-[#6B1D2F] hover:bg-[#4A121F] text-white text-xs font-semibold whitespace-nowrap text-center shadow-xs"
          >
            Hubungi Pengelola
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#6B1D2F] text-[#F9F5EC] text-center py-4 text-xs mt-auto">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}
