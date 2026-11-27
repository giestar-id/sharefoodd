'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FoodItem } from '@/types';

function PostMakananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, foods, requests, createFood, updateFood, cancelFood, approveRequest, declineRequest, markAsTaken, isLoaded } = useApp();

  // Route protection
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  // Tab State
  const initialTab = searchParams.get('tab') || 'post';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [subTab, setSubTab] = useState<'permintaan-gratis' | 'pesanan-bayar' | 'selesai-pesanan'>('permintaan-gratis');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Form State
  const [foodTitle, setFoodTitle] = useState('');
  const [tipe, setTipe] = useState<'gratis' | 'berbayar'>('gratis');
  const [price, setPrice] = useState<number | ''>('');
  const [portion, setPortion] = useState<number | ''>('');
  const [pickupDeadline, setPickupDeadline] = useState('20:00');
  const [mapsUrl, setMapsUrl] = useState('');
  const [foodLat, setFoodLat] = useState<number | null>(null);
  const [foodLng, setFoodLng] = useState<number | null>(null);
  const [addressNote, setAddressNote] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setWhatsappNumber((prev) => prev || user.phone || '');
    }
  }, [user?.phone]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const editPost = async (f: FoodItem) => {
    const newPortion = prompt(`Ubah jumlah stok porsi untuk "${f.title}":`, String(f.quantity));
    if (newPortion !== null && !isNaN(Number(newPortion)) && Number(newPortion) >= 0) {
      await updateFood(f.id, { quantity: parseInt(newPortion, 10) });
      showToast('Jumlah porsi menu berhasil diperbarui!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Image Preview Handlers
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setQrisPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Automatically detect seller GPS coordinates on mount & pre-fill Google Maps URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyCoords = (latRaw: number, lngRaw: number) => {
      const lat = Number(latRaw.toFixed(6));
      const lng = Number(lngRaw.toFixed(6));
      setFoodLat(lat);
      setFoodLng(lng);
      setMapsUrl((prev) => (prev ? prev : `https://www.google.com/maps?q=${lat},${lng}`));
    };

    try {
      const cached = sessionStorage.getItem('sharefood_user_loc');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          applyCoords(parsed.lat, parsed.lng);
        }
      }
    } catch {}

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyCoords(pos.coords.latitude, pos.coords.longitude);
          try {
            sessionStorage.setItem(
              'sharefood_user_loc',
              JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            );
          } catch {}
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  // Form Submit Handler
  const handleFormPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodTitle.trim()) {
      showToast('Harap isi nama makanan / menu');
      return;
    }

    try {
      setIsSubmitting(true);
      await createFood({
        title: foodTitle,
        category: tipe === 'berbayar' ? 'berbayar' : 'makanan_berat',
        quantity: Number(portion) || 1,
        unit: 'porsi',
        pickupDeadline: `Hari ini, ${pickupDeadline} WIB`,
        areaLabel: addressNote || 'Sekitar Toko',
        description: addressNote,
        type: tipe,
        price: tipe === 'berbayar' ? Number(price) || 0 : 0,
        mapsUrl: mapsUrl,
        latitude: foodLat,
        longitude: foodLng,
        qrisUrl: qrisPreview || '',
        whatsappNumber: whatsappNumber,
        addressNote: addressNote,
        images: fotoPreview
          ? [fotoPreview]
          : [
              tipe === 'gratis'
                ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            ],
      });

      showToast('Berhasil diposting dan tersimpan di Cloud Database!');

      // Reset form
      setFoodTitle('');
      setTipe('gratis');
      setPrice('');
      setPortion('');
      setMapsUrl('');
      setFoodLat(null);
      setFoodLng(null);
      setAddressNote('');
      setFotoPreview(null);
      setQrisPreview(null);

      // Switch to Kelola tab to view posted food
      setActiveTab('kelola');
    } catch (err: any) {
      console.error('Error posting makanan:', err);
      showToast('Gagal posting: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Seller's Foods & Requests (Strictly matched by userId FK; keep 0-stock visible in Kelola Post so seller can restock)
  const myFoods = foods.filter((f) => Boolean(user?.id) && f.userId === user?.id);
  const myActiveFoods = myFoods.filter((f) => f.status === 'AVAILABLE');

  // Filter incoming requests for seller's foods
  const myFoodIds = new Set(myFoods.map((f) => f.id));
  const myIncomingRequests = requests.filter((r) => myFoodIds.has(r.foodId));

  const incomingGratis = myIncomingRequests.filter((r) => {
    const parentFood = myFoods.find((f) => f.id === r.foodId);
    const isGratis = parentFood?.type !== 'berbayar' && parentFood?.category !== 'berbayar';
    return r.status === 'PENDING' && isGratis;
  });

  const incomingBerbayar = myIncomingRequests.filter((r) => {
    const parentFood = myFoods.find((f) => f.id === r.foodId);
    const isPaid = parentFood?.type === 'berbayar' || parentFood?.category === 'berbayar';
    return r.status === 'PENDING' && isPaid;
  });

  const confirmedOrders = myIncomingRequests.filter((r) => r.status === 'APPROVED');

  // Auto-select non-empty sub-tab only when entering Pesanan Masuk tab (without locking manual sub-tab clicks)
  useEffect(() => {
    if (activeTab === 'permintaan') {
      if (incomingGratis.length > 0) {
        setSubTab('permintaan-gratis');
      } else if (incomingBerbayar.length > 0) {
        setSubTab('pesanan-bayar');
      } else if (confirmedOrders.length > 0) {
        setSubTab('selesai-pesanan');
      } else {
        setSubTab('permintaan-gratis');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Calculate Transaction Stats (Only COMPLETED orders count toward finalized history & omzet)
  const completedRequests = myIncomingRequests.filter((r) => r.status === 'COMPLETED');

  let totalOmzet = 0;
  let terjualCount = 0;
  let dibagikanCount = 0;

  completedRequests.forEach((r) => {
    const foodItem = myFoods.find((f) => f.id === r.foodId);
    if (foodItem?.type === 'berbayar' || foodItem?.category === 'berbayar') {
      const p = foodItem.price || 15000;
      totalOmzet += p;
      terjualCount += 1;
    } else {
      dibagikanCount += 1;
    }
  });

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#333333]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <style jsx global>{`
        /* EXACT STYLES FROM hmm/sharefood/style.css */
        .post-navbar {
          background-color: #6B1D2F;
          color: #FFFFFF;
          padding: 0.75rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .post-logo {
          font-size: 1.4rem;
          font-weight: 700;
          color: #F9F5EC;
          text-decoration: none;
        }

        .post-nav-links {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .post-nav-btn {
          background: transparent;
          border: none;
          color: #F9F5EC;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
        }

        .post-nav-btn:hover,
        .post-nav-btn.active {
          background-color: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
        }

        .post-mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: #6B1D2F;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          justify-content: space-around;
          padding: 0.4rem 0;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
        }

        .post-mobile-nav-btn {
          background: none;
          border: none;
          color: #F9F5EC;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          opacity: 0.7;
          text-decoration: none;
        }

        .post-mobile-nav-btn span {
          font-size: 1.2rem;
          margin-bottom: 0.1rem;
        }

        .post-mobile-nav-btn.active {
          opacity: 1;
          color: #FFFFFF;
        }

        @media (max-width: 600px) {
          .post-nav-links {
            display: none !important;
          }
          .post-mobile-nav {
            display: flex !important;
          }
          body, .container {
            padding-bottom: 70px;
          }
        }

        .container {
          max-width: 900px;
          margin: 1.25rem auto;
          padding: 0 1rem;
          flex: 1;
          width: 100%;
        }

        .card-box {
          background: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .form-title {
          font-size: 1.25rem;
          color: #6B1D2F;
          margin-bottom: 1.25rem;
          font-weight: 700;
        }

        .form-group {
          margin-bottom: 1.1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.35rem;
          color: #333333;
        }

        .form-control {
          width: 100%;
          padding: 0.65rem;
          font-size: 0.9rem;
          color: #222222;
          border: 1px solid #CCCCCC;
          border-radius: 5px;
          outline: none;
          background: #FFF;
          box-sizing: border-box;
        }

        .form-control::placeholder {
          color: #9CA3AF;
          opacity: 1;
        }

        .form-control:focus {
          border-color: #6B1D2F;
        }

        .image-preview {
          width: 100%;
          max-height: 180px;
          border: 2px dashed #E8E2D5;
          border-radius: 6px;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #F9F5EC;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 0.65rem;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
          transition: 0.2s;
        }

        .btn:active {
          transform: scale(0.98);
        }

        .btn-green {
          background-color: #2E7D32;
          color: #FFF;
        }

        .btn-green:hover {
          background-color: #246B27;
        }

        .btn-orange {
          background-color: #E65100;
          color: #FFF;
        }

        .btn-orange:hover {
          background-color: #BF360C;
        }

        .btn-red {
          background-color: #C62828;
          color: #FFF;
        }

        .btn-red:hover {
          background-color: #B71C1C;
        }

        .btn-burgundy {
          background-color: #6B1D2F;
          color: #FFF;
        }

        .btn-burgundy:hover {
          background-color: #521524;
        }

        .btn-sm {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
          width: auto;
          display: inline-block;
        }

        .sub-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 1.25rem;
          border-bottom: 2px solid #E8E2D5;
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .sub-btn {
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          color: #666;
          padding: 0.5rem 0.85rem;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .sub-btn.active {
          background-color: #6B1D2F;
          color: #FFFFFF;
        }

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .list-item {
          background: #FFF;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .list-info h4 {
          color: #6B1D2F;
          margin-bottom: 0.2rem;
          font-weight: 700;
        }

        .list-info p {
          font-size: 0.85rem;
          color: #666;
        }

        .list-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: #FDFBF7;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .stat-card h4 {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .stat-card div {
          font-size: 1.25rem;
          font-weight: 700;
          color: #6B1D2F;
        }

        .footer {
          background-color: #6B1D2F;
          color: #F9F5EC;
          text-align: center;
          padding: 1rem;
          font-size: 0.85rem;
          margin-top: auto;
        }

        #toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 3000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .toast {
          background-color: #6B1D2F;
          color: #FFFFFF;
          padding: 0.75rem 1.25rem;
          border-radius: 6px;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* KARTU ITEM & LIST STYLING (baru/post-makanan.html) */
        .order-card, .post-manage-card {
          background: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 10px;
          padding: 1.2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #6B1D2F;
        }
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .badge-pending  { background: #FFF3E0; color: #E65100; }
        .badge-approved { background: #E8F5E9; color: #2E7D32; }
        .badge-done     { background: #ECEFF1; color: #455A64; }

        .card-meta {
          font-size: 0.875rem;
          color: #444;
          line-height: 1.5;
        }
        .card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }
        .btn-act {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.825rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .btn-act:hover { opacity: 0.9; }
        .btn-confirm { background-color: #2E7D32; color: #FFF; }
        .btn-reject  { background-color: #C62828; color: #FFF; }
        .btn-complete{ background-color: #1565C0; color: #FFF; }
        .btn-wa      { background-color: #25D366; color: #FFF; }
        .btn-edit    { background-color: #E65100; color: #FFF; }
        .btn-delete  { background-color: #757575; color: #FFF; }
        .btn-detail  { background-color: #2E7D32; color: #FFF; }

        /* MODAL */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 2000;
        }

        .modal-content {
          background: #FFF;
          border-radius: 8px;
          padding: 1.5rem;
          max-width: 440px;
          width: 100%;
          text-align: center;
          position: relative;
        }
      `}</style>

      {/* TOAST CONTAINER */}
      <div id="toast-container">
        {toastMessage && <div className="toast">{toastMessage}</div>}
      </div>

      {/* NAVBAR DESKTOP */}
      <nav className="post-navbar">
        <Link href="/" className="post-logo">
          ShareFood
        </Link>
        <div className="post-nav-links">
          <button
            className={`post-nav-btn ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => setActiveTab('post')}
          >
            ➕ Post & Menu
          </button>
          <button
            className={`post-nav-btn ${activeTab === 'permintaan' ? 'active' : ''}`}
            onClick={() => setActiveTab('permintaan')}
          >
            🔔 Pesanan Masuk
            {myIncomingRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span
                style={{
                  backgroundColor: '#D32F2F',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  marginLeft: '6px',
                }}
              >
                {myIncomingRequests.filter((r) => r.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            className={`post-nav-btn ${activeTab === 'kelola' ? 'active' : ''}`}
            onClick={() => setActiveTab('kelola')}
          >
            📦 Kelola Post
          </button>
          <button
            className={`post-nav-btn ${activeTab === 'riwayat-transaksi' ? 'active' : ''}`}
            onClick={() => setActiveTab('riwayat-transaksi')}
          >
            💰 Transaksi
          </button>
          <Link href="/profil-penjual" className="post-nav-btn">
            👤 Profil Toko
          </Link>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="post-mobile-nav">
        <button
          className={`post-mobile-nav-btn ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <span>➕</span>Post
        </button>
        <button
          className={`post-mobile-nav-btn ${activeTab === 'permintaan' ? 'active' : ''}`}
          onClick={() => setActiveTab('permintaan')}
        >
          <span>🔔</span>Pesanan
        </button>
        <button
          className={`post-mobile-nav-btn ${activeTab === 'kelola' ? 'active' : ''}`}
          onClick={() => setActiveTab('kelola')}
        >
          <span>📦</span>Kelola
        </button>
        <button
          className={`post-mobile-nav-btn ${activeTab === 'riwayat-transaksi' ? 'active' : ''}`}
          onClick={() => setActiveTab('riwayat-transaksi')}
        >
          <span>💰</span>Omzet
        </button>
        <Link href="/profil-penjual" className="post-mobile-nav-btn">
          <span>👤</span>Profil
        </Link>
      </div>

      {/* MAIN CONTAINER */}
      <main className="container">
        {/* TAB 1: FORM POST MAKANAN / TAMBAH MENU */}
        {activeTab === 'post' && (
          <section id="tab-post" className="tab-content active">
            <div className="card-box">
              <h2 className="form-title">Posting Makanan Gratis / Jualan Menu</h2>
              <form id="form-post-makanan" onSubmit={handleFormPost}>
                <div className="form-group">
                  <label htmlFor="foto">Foto Makanan</label>
                  <input
                    type="file"
                    id="foto"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFotoChange}
                  />
                  {fotoPreview && (
                    <div id="preview-foto" className="image-preview">
                      <img src={fotoPreview} alt="Preview Foto Makanan" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="food_title">Nama Makanan / Menu</label>
                  <input
                    type="text"
                    id="food_title"
                    className="form-control"
                    placeholder="Contoh: Mie Ayam Gang 3 / Nasi Sisa Catering"
                    value={foodTitle}
                    onChange={(e) => setFoodTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipe">Tipe Posting</label>
                  <select
                    id="tipe"
                    className="form-control"
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value as 'gratis' | 'berbayar')}
                  >
                    <option value="gratis">Berbagi Makanan Gratis (Rp 0)</option>
                    <option value="berbayar">Jualan Menu Toko (Self-Pickup)</option>
                  </select>
                </div>

                {tipe === 'berbayar' && (
                  <div className="form-group" id="harga-group">
                    <label htmlFor="price">Harga Menu (Rp)</label>
                    <input
                      type="number"
                      id="price"
                      className="form-control"
                      placeholder="12000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                      required={tipe === 'berbayar'}
                    />
                  </div>
                )}

                {tipe === 'berbayar' && (
                  <div className="form-group" id="qris-group">
                    <label htmlFor="qris_image">Gambar QRIS Toko (Opsional)</label>
                    <input
                      type="file"
                      id="qris_image"
                      className="form-control"
                      accept="image/*"
                      onChange={handleQrisChange}
                    />
                    {qrisPreview && (
                      <div id="preview-qris" className="image-preview">
                        <img src={qrisPreview} alt="Preview QRIS" />
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="portion">Jumlah Stok / Porsi</label>
                  <input
                    type="number"
                    id="portion"
                    className="form-control"
                    placeholder="Contoh: 5"
                    min="1"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value ? Number(e.target.value) : '')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pickup_deadline">Batas Jam Pengambilan / Buka Toko</label>
                  <input
                    type="time"
                    id="pickup_deadline"
                    className="form-control"
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maps_url">Link Google Maps Toko / Rumah</label>
                  <input
                    type="url"
                    id="maps_url"
                    className="form-control"
                    placeholder="https://maps.google.com/..."
                    value={mapsUrl}
                    onChange={(e) => {
                      setMapsUrl(e.target.value);
                      setFoodLat(null);
                      setFoodLng(null);
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address_note">Patokan Lokasi (Khusus Toko di Gang Sempit)</label>
                  <input
                    type="text"
                    id="address_note"
                    className="form-control"
                    placeholder="Contoh: Masuk Gang Mawar samping Pos Ronda, rumah pagar merah No. 12"
                    value={addressNote}
                    onChange={(e) => setAddressNote(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp_number">Nomor WhatsApp Aktif Toko</label>
                  <input
                    type="tel"
                    id="whatsapp_number"
                    className="form-control"
                    placeholder="Contoh: 081234567890"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-green"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {isSubmitting ? 'Memproses...' : 'Publikasikan Sekarang'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* TAB 2: PESANAN MASUK */}
        {activeTab === 'permintaan' && (
          <section id="tab-permintaan" className="tab-content active">
            <div className="card-box">
              <h2 className="form-title">Daftar Pesanan &amp; Permintaan Masuk</h2>

              <div className="sub-tabs">
                <button
                  className={`sub-btn ${subTab === 'permintaan-gratis' ? 'active' : ''}`}
                  onClick={() => setSubTab('permintaan-gratis')}
                >
                  🎁 Permintaan Gratis
                </button>
                <button
                  className={`sub-btn ${subTab === 'pesanan-bayar' ? 'active' : ''}`}
                  onClick={() => setSubTab('pesanan-bayar')}
                >
                  🏷️ Pesanan Berbayar
                </button>
                <button
                  className={`sub-btn ${subTab === 'selesai-pesanan' ? 'active' : ''}`}
                  onClick={() => setSubTab('selesai-pesanan')}
                >
                  🎉 Selesaikan Pesanan
                </button>
              </div>

              {/* Subtab 1: Permintaan Gratis (HANYA KONFIRMASI, TOLAK, CHAT WA) */}
              {subTab === 'permintaan-gratis' && (
                <div id="sub-permintaan-gratis" className="sub-tab-content active">
                  <div className="list-container" id="container-permintaan-gratis">
                    {incomingGratis.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                        Belum ada permintaan makanan gratis masuk.
                      </p>
                    ) : (
                      incomingGratis.map((req) => (
                        <div key={req.id} className="order-card">
                          <div className="card-top">
                            <div className="card-title">🎁 {req.foodTitle || 'Makanan Gratis'}</div>
                            <span className="badge badge-pending">Perlu Dikonfirmasi</span>
                          </div>
                          <div className="card-meta">
                            <strong>Pemohon:</strong> {req.requesterName} (1 Porsi)<br />
                            <strong>Waktu:</strong> {req.createdAt}
                          </div>
                          <div className="card-actions">
                            <button
                              onClick={async () => {
                                await approveRequest(req.id);
                                showToast('Pesanan dikonfirmasi! Pindah ke sub-tab Selesaikan Pesanan.');
                              }}
                              className="btn-act btn-confirm"
                            >
                              ✅ Konfirmasi Pesanan
                            </button>
                            <button
                              onClick={async () => {
                                await declineRequest(req.id);
                                showToast('Pesanan ditolak/dibatalkan.');
                              }}
                              className="btn-act btn-reject"
                            >
                              ❌ Tolak Pesanan
                            </button>
                            <a
                              href={`https://wa.me/?text=Halo%20${encodeURIComponent(
                                req.requesterName
                              )},%20mengenai%20klaim%20${encodeURIComponent(req.foodTitle || 'makanan')}%20ShareFood.`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-act btn-wa"
                            >
                              💬 Chat WA Pembeli
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Subtab 2: Pesanan Berbayar (HANYA KONFIRMASI, TOLAK, CHAT WA) */}
              {subTab === 'pesanan-bayar' && (
                <div id="sub-pesanan-bayar" className="sub-tab-content active">
                  <div className="list-container" id="container-pesanan-bayar">
                    {incomingBerbayar.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                        Belum ada pesanan berbayar masuk.
                      </p>
                    ) : (
                      incomingBerbayar.map((req) => {
                        const parentFood = myFoods.find((f) => f.id === req.foodId);
                        const priceVal = Number(parentFood?.price || 15000);
                        return (
                          <div key={req.id} className="order-card">
                            <div className="card-top">
                              <div className="card-title">🏷️ {req.foodTitle || 'Menu Toko'}</div>
                              <span className="badge badge-pending">Perlu Dikonfirmasi</span>
                            </div>
                            <div className="card-meta">
                              <strong>Pembeli:</strong> {req.requesterName} (1 Porsi)<br />
                              <strong>Total Pembayaran:</strong> Rp {priceVal.toLocaleString('id-ID')}<br />
                              <strong>Waktu:</strong> {req.createdAt}
                            </div>
                            <div className="card-actions">
                              <button
                                onClick={async () => {
                                  await approveRequest(req.id);
                                  showToast('Pesanan dikonfirmasi! Pindah ke sub-tab Selesaikan Pesanan.');
                                }}
                                className="btn-act btn-confirm"
                              >
                                ✅ Konfirmasi Pesanan
                              </button>
                              <button
                                onClick={async () => {
                                  await declineRequest(req.id);
                                  showToast('Pesanan ditolak/dibatalkan.');
                                }}
                                className="btn-act btn-reject"
                              >
                                ❌ Tolak Pesanan
                              </button>
                              <a
                                href={`https://wa.me/?text=Halo%20${encodeURIComponent(
                                  req.requesterName
                                )},%20pesanan%20menu%20${encodeURIComponent(req.foodTitle || '')}%20di%20ShareFood.`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-act btn-wa"
                              >
                                💬 Chat WA Pembeli
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Subtab 3: Selesaikan Pesanan (KHUSUS PESANAN YANG SUDAH DIKONFIRMASI) */}
              {subTab === 'selesai-pesanan' && (
                <div id="sub-selesai-pesanan" className="sub-tab-content active">
                  <div className="list-container" id="container-selesai-pesanan">
                    {confirmedOrders.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                        Belum ada pesanan yang siap diselesaikan.
                      </p>
                    ) : (
                      confirmedOrders.map((req) => {
                        const parentFood = myFoods.find((f) => f.id === req.foodId);
                        const isGratis = parentFood?.type !== 'berbayar' && parentFood?.category !== 'berbayar';
                        const priceVal = Number(parentFood?.price || 15000);
                        return (
                          <div key={req.id} className="order-card" style={{ borderLeft: '5px solid #1565C0' }}>
                            <div className="card-top">
                              <div className="card-title">{isGratis ? '🎁' : '🏷️'} {req.foodTitle || 'Pesanan'}</div>
                              <span className="badge badge-approved">Pesanan Diterima / Siap Ambil</span>
                            </div>
                            <div className="card-meta">
                              <strong>Pembeli/Pemohon:</strong> {req.requesterName} (1 Porsi)<br />
                              <strong>Total:</strong> {isGratis ? 'Rp 0 (Gratis)' : `Rp ${priceVal.toLocaleString('id-ID')}`}<br />
                              <strong>Waktu:</strong> {req.respondedAt || req.createdAt}
                            </div>
                            <div className="card-actions">
                              <button
                                onClick={async () => {
                                  await markAsTaken(req.foodId, req.id);
                                  showToast('Pesanan Selesai! Data transaksi direkap ke menu Omzet.');
                                }}
                                className="btn-act btn-complete"
                              >
                                🎉 Selesaikan Pesanan
                              </button>
                              <a
                                href={`https://wa.me/?text=Halo%20${encodeURIComponent(
                                  req.requesterName
                                )},%20pesanan%20${encodeURIComponent(req.foodTitle || '')}%20siap%20diambil!`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-act btn-wa"
                              >
                                💬 Chat WA Pembeli
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: KELOLA MENU & POSTINGAN */}
        {activeTab === 'kelola' && (
          <section id="tab-kelola" className="tab-content active">
            <div className="card-box">
              <h2 className="form-title">Kelola Menu &amp; Postingan Aktif</h2>
              <div className="list-container" id="container-kelola-post">
                {myActiveFoods.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                    Belum ada postingan atau menu aktif.
                  </p>
                ) : (
                  myActiveFoods.map((f) => {
                    const isGratis = f.type !== 'berbayar' && f.category !== 'berbayar';
                    return (
                      <div key={f.id} className="post-manage-card">
                        <div className="card-top">
                          <div className="card-title">{isGratis ? '🎁' : '🏷️'} {f.title}</div>
                          <span className={`badge ${isGratis ? 'badge-approved' : 'badge-pending'}`}>
                            {isGratis ? 'Gratis (Rp 0)' : `Rp ${Number(f.price || 0).toLocaleString('id-ID')}`}
                          </span>
                        </div>
                        <div className="card-meta">
                          <strong>Stok Tersedia:</strong> {f.quantity} Porsi &bull;{' '}
                          <strong>Batas Ambil:</strong> s/d {f.pickupDeadline}<br />
                          📍 <strong>Patokan:</strong> {f.addressNote || f.areaLabel}
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => editPost(f)}
                            className="btn-act btn-edit"
                          >
                            ✏️ Edit Menu
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Apakah Anda yakin ingin menghapus postingan menu ini?')) {
                                await cancelFood(f.id);
                                showToast('Postingan menu berhasil dihapus!');
                              }
                            }}
                            className="btn-act btn-delete"
                          >
                            🗑️ Hapus Post
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: RIWAYAT TRANSAKSI TOKO */}
        {activeTab === 'riwayat-transaksi' && (
          <section id="tab-riwayat-transaksi" className="tab-content active">
            <div className="card-box">
              <h2 className="form-title">Riwayat Transaksi &amp; Rekap Keuangan</h2>

              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Omzet</h4>
                  <div id="stat-total-omzet">
                    Rp {totalOmzet.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Makanan Terjual</h4>
                  <div id="stat-terjual">{terjualCount} Porsi</div>
                </div>
                <div className="stat-card">
                  <h4>Makanan Dibagikan</h4>
                  <div id="stat-dibagikan">{dibagikanCount} Porsi</div>
                </div>
              </div>

              <div className="list-container" id="container-riwayat-transaksi">
                {completedRequests.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                    Belum ada riwayat transaksi selesai.
                  </p>
                ) : (
                  completedRequests.map((r) => {
                    const f = myFoods.find((food) => food.id === r.foodId);
                    const isPaid = f?.type === 'berbayar' || f?.category === 'berbayar';
                    const priceVal = Number(f?.price || 15000);
                    return (
                      <div
                        key={r.id}
                        className="order-card"
                        style={{ borderLeft: `5px solid ${isPaid ? '#1565C0' : '#2E7D32'}` }}
                      >
                        <div className="card-top">
                          <div className="card-title">{isPaid ? '🏷️' : '🎁'} {r.foodTitle || f?.title || 'Transaksi Selesai'}</div>
                          <span className="badge badge-done">
                            {isPaid ? `Selesai (Rp ${priceVal.toLocaleString('id-ID')})` : 'Selesai (Gratis)'}
                          </span>
                        </div>
                        <div className="card-meta">
                          <strong>Penerima/Pembeli:</strong> {r.requesterName} (1 Porsi)<br />
                          <strong>Waktu Transaksi Selesai:</strong> {r.respondedAt || r.createdAt}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: PROFIL TOKO (Fallback tab in HTML) */}
        {activeTab === 'profil' && (
          <section id="tab-profil" className="tab-content active">
            <div className="card-box" style={{ maxWidth: '550px' }}>
              <h2 className="form-title">Profil Toko / Warung Hidden Gem</h2>

              <div className="form-group">
                <label>Nama Toko / Warung</label>
                <p id="profil-nama-toko" style={{ fontWeight: 600, color: '#6B1D2F' }}>
                  {user?.name || 'Toko Demo'}
                </p>
              </div>

              <div className="form-group">
                <label>Status Toko</label>
                <span
                  style={{
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  🟢 Buka (Menerima Pesanan)
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <Link href="/role-select" className="btn btn-burgundy" style={{ width: '100%' }}>
                  Ganti Role
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}

export default function PostMakananPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#888888]">Memuat halaman...</div>}>
      <PostMakananContent />
    </Suspense>
  );
}
