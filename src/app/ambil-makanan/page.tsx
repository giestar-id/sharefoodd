'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { calculateDistanceKm } from '@/lib/geo';

function AmbilMakananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, foods, requests, requestFood, isLoaded } = useApp();

  // Route protection
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  // Tab State
  const initialTab = searchParams.get('tab') || 'gratis';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Search & Filter State
  const [searchGratis, setSearchGratis] = useState('');
  const [radiusGratis, setRadiusGratis] = useState('all');
  const [searchBerbayar, setSearchBerbayar] = useState('');
  const [radiusBerbayar, setRadiusBerbayar] = useState('all');

  // Real-time Buyer Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied'>('loading');
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestUserLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('denied');
      setLocationError('Browser tidak mendukung deteksi lokasi.');
      return;
    }

    setLocationStatus('loading');
    setLocationError(null);

    const onSuccess = (pos: GeolocationPosition) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setUserLocation(coords);
      setLocationStatus('granted');
      setLocationError(null);
      try {
        sessionStorage.setItem('sharefood_user_loc', JSON.stringify(coords));
      } catch {}
    };

    // Use fast Wi-Fi/Network/GPS fix first (resolves in <1s on laptops & indoor phones)
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        if (err.code === 1) {
          // PERMISSION_DENIED
          setUserLocation(null);
          setLocationStatus('denied');
          setLocationError('Izin lokasi ditolak browser. Aktifkan izin lokasi di pengaturan browser Anda.');
          return;
        }
        // On TIMEOUT (3) or POSITION_UNAVAILABLE (2), auto-retry once with relaxed cached fallback
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => {
            setLocationStatus('denied');
            setLocationError('Gagal mendeteksi lokasi perangkat. Pastikan GPS / Layanan Lokasi aktif.');
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    // Restore cached session location immediately so UI feels instant, then refresh in background
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('sharefood_user_loc');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
            setUserLocation(parsed);
            setLocationStatus('granted');
          }
        }
      } catch {}
    }
    requestUserLocation();
  }, []);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [qrisModalFood, setQrisModalFood] = useState<any>(null);
  const [orderMessage, setOrderMessage] = useState('Halo, saya ingin mengambil makanan ini melalui ShareFood.');
  const [orderTime, setOrderTime] = useState('18:00');
  const [isOrdering, setIsOrdering] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const openModal = (food: any) => {
    const alreadyOrdered = requests.some(
      (r) =>
        r.foodId === food.id &&
        r.requesterId === user?.id &&
        (r.status === 'PENDING' || r.status === 'APPROVED')
    );

    if (alreadyOrdered) {
      showToast('Pesanan untuk menu ini sudah tercatat! Cek status Anda di sini.');
      setActiveTab('notifikasi');
      return;
    }

    const isFoodGratis = food.type !== 'berbayar' && food.category !== 'berbayar';
    if (isFoodGratis && todayFreeCount >= 3) {
      showToast('Batas ambil makanan gratis hari ini sudah habis (3/3). Anda bisa mengambil lagi besok!');
      return;
    }

    setSelectedFood(food);
    setOrderTime(food.pickupDeadline ? food.pickupDeadline.replace(/[^\d:]/g, '') || '18:00' : '18:00');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFood(null);
  };

  const handleConfirmOrder = async () => {
    if (!selectedFood || isOrdering) return;
    const alreadyOrdered = requests.some(
      (r) =>
        r.foodId === selectedFood.id &&
        r.requesterId === user?.id &&
        (r.status === 'PENDING' || r.status === 'APPROVED')
    );

    if (alreadyOrdered) {
      closeModal();
      showToast('Pesanan untuk menu ini sudah tercatat!');
      setActiveTab('notifikasi');
      return;
    }

    try {
      setIsOrdering(true);
      await requestFood(selectedFood.id, orderMessage, `Hari ini, ${orderTime} WIB`);
      closeModal();
      showToast('Status pesanan berhasil diperbarui!');
      setActiveTab('notifikasi');
    } catch (err: any) {
      showToast('Gagal mengirim pesanan: ' + err.message);
    } finally {
      setIsOrdering(false);
    }
  };

  // Filter Foods + Compute Distance & Sort Nearest (Hide if stock <= 0)
  const availableFoods = foods
    .filter((f) => f.status === 'AVAILABLE' && Number(f.quantity) > 0)
    .map((f) => {
      const hasCoords = typeof f.latitude === 'number' && typeof f.longitude === 'number';
      const distanceKm =
        userLocation && hasCoords
          ? calculateDistanceKm(userLocation.lat, userLocation.lng, f.latitude!, f.longitude!)
          : null;
      return { ...f, distanceKm };
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });

  const maxRadiusGratis = radiusGratis === 'all' ? Infinity : parseFloat(radiusGratis);
  const gratisFoods = availableFoods.filter((f) => {
    const isGratis = f.type !== 'berbayar' && f.category !== 'berbayar';
    const matchesSearch =
      f.title.toLowerCase().includes(searchGratis.toLowerCase()) ||
      (f.addressNote && f.addressNote.toLowerCase().includes(searchGratis.toLowerCase())) ||
      f.areaLabel.toLowerCase().includes(searchGratis.toLowerCase());
    const matchesRadius =
      radiusGratis === 'all' || !userLocation || (f.distanceKm !== null && f.distanceKm <= maxRadiusGratis);
    return isGratis && matchesSearch && matchesRadius;
  });

  const maxRadiusBerbayar = radiusBerbayar === 'all' ? Infinity : parseFloat(radiusBerbayar);
  const berbayarFoods = availableFoods.filter((f) => {
    const isPaid = f.type === 'berbayar' || f.category === 'berbayar';
    const matchesSearch =
      f.title.toLowerCase().includes(searchBerbayar.toLowerCase()) ||
      (f.addressNote && f.addressNote.toLowerCase().includes(searchBerbayar.toLowerCase())) ||
      f.areaLabel.toLowerCase().includes(searchBerbayar.toLowerCase());
    const matchesRadius =
      radiusBerbayar === 'all' || !userLocation || (f.distanceKm !== null && f.distanceKm <= maxRadiusBerbayar);
    return isPaid && matchesSearch && matchesRadius;
  });

  // User's Requests (Notifikasi & Status vs Riwayat) — strictly matched by requesterId FK
  const myRequests = requests.filter((r) => Boolean(user?.id) && r.requesterId === user?.id);
  const todayWibPrefix = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const todayFreeCount = myRequests.filter((r) => {
    if (r.status !== 'PENDING' && r.status !== 'APPROVED' && r.status !== 'COMPLETED') return false;
    if (!r.createdAt || !r.createdAt.includes(todayWibPrefix)) return false;
    const parent = foods.find((f) => f.id === r.foodId);
    const isPaid = parent
      ? parent.type === 'berbayar' || parent.category === 'berbayar'
      : r.foodCategory === 'berbayar';
    return !isPaid;
  }).length;
  const isDailyFreeLimitReached = todayFreeCount >= 3;
  const notifikasiMyRequests = myRequests.filter(
    (r) => r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'DECLINED' || r.status === 'CANCELLED'
  );
  const finishedMyRequests = myRequests.filter((r) => r.status === 'COMPLETED');

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#333333]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <style jsx global>{`
        /* EXACT STYLES FROM hmm/sharefood/style.css */
        .ambil-navbar {
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

        .ambil-logo {
          font-size: 1.4rem;
          font-weight: 700;
          color: #F9F5EC;
          text-decoration: none;
        }

        .ambil-nav-links {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .ambil-nav-btn {
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

        .ambil-nav-btn:hover,
        .ambil-nav-btn.active {
          background-color: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
        }

        .ambil-mobile-nav {
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

        .ambil-mobile-nav-btn {
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

        .ambil-mobile-nav-btn span {
          font-size: 1.2rem;
          margin-bottom: 0.1rem;
        }

        .ambil-mobile-nav-btn.active {
          opacity: 1;
          color: #FFFFFF;
        }

        @media (max-width: 600px) {
          .ambil-nav-links {
            display: none !important;
          }
          .ambil-mobile-nav {
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

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #FFFFFF;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #E8E2D5;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .toolbar h2 {
          font-size: 1.2rem;
          color: #6B1D2F;
          font-weight: 700;
        }

        .filter-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .search-input, .select-input {
          padding: 0.45rem 0.65rem;
          border: 1px solid #CCCCCC;
          border-radius: 5px;
          outline: none;
          background: #FFF;
          font-size: 0.85rem;
        }

        .search-input:focus, .select-input:focus {
          border-color: #6B1D2F;
        }

        .food-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .food-card {
          background: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .food-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .food-img {
          width: 100%;
          height: 140px;
          background-color: #E8E2D5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          font-size: 2.5rem;
          object-fit: cover;
        }

        .food-body {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .store-name {
          font-size: 0.8rem;
          color: #6B1D2F;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .food-title {
          font-size: 1.05rem;
          color: #333;
          margin-bottom: 0.4rem;
          font-weight: 700;
        }

        .food-info {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.8rem;
          line-height: 1.4;
        }

        .price-tag {
          font-weight: 700;
          color: #E65100;
          font-size: 1rem;
          margin-bottom: 0.8rem;
        }

        .price-free {
          font-weight: 700;
          color: #2E7D32;
          font-size: 1rem;
          margin-bottom: 0.8rem;
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

        .btn-burgundy {
          background-color: #6B1D2F;
          color: #FFF;
        }

        .btn-burgundy:hover {
          background-color: #521524;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          background: #FFF;
          border: 1px solid #E8E2D5;
          border-radius: 8px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .empty-state h3 {
          color: #6B1D2F;
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .empty-state p {
          font-size: 0.9rem;
          color: #666;
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

        /* STYLING KARTU NOTIFIKASI & BADGE STATUS (baru/ambil-makanan.html) */
        .status-card {
          background: #FFFFFF;
          border: 1px solid #E8E2D5;
          border-radius: 12px;
          padding: 1.2rem 1.4rem;
          margin-bottom: 1rem;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease;
        }
        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .status-title {
          font-weight: 700;
          color: #6B1D2F;
          font-size: 1.05rem;
        }
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .badge-pending  { background: #FFF3E0; color: #E65100; }
        .badge-approved { background: #E8F5E9; color: #2E7D32; }
        .badge-paid     { background: #E3F2FD; color: #1565C0; }
        .badge-canceled { background: #FFEBEE; color: #C62828; }

        .status-detail { font-size: 0.9rem; color: #444; margin-bottom: 0.5rem; line-height: 1.4; }
        .status-time   { font-size: 0.775rem; color: #888; margin-bottom: 0.8rem; }

        .action-btn-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-action {
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .btn-wa { background-color: #25D366; color: #FFF; }
        .btn-wa:hover { background-color: #1EBE5D; }
        .btn-gmaps { background-color: #1976D2; color: #FFF; }
        .btn-gmaps:hover { background-color: #1565C0; }
        .btn-qris-action { background-color: #E65100; color: #FFF; }
        .btn-qris-action:hover { background-color: #EF6C00; }

        .modal-box-alert {
          text-align: center;
          padding: 0.5rem;
        }
        .modal-icon-wait {
          font-size: 3rem;
          margin-bottom: 0.5rem;
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

        .modal-content h3 {
          color: #6B1D2F;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .modal-content p {
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 1.25rem;
        }

        .qris-box {
          background: #F9F5EC;
          border: 1px dashed #6B1D2F;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }
      `}</style>

      {/* TOAST CONTAINER */}
      <div id="toast-container">
        {toastMessage && <div className="toast">{toastMessage}</div>}
      </div>

      {/* NAVBAR DESKTOP */}
      <nav className="ambil-navbar">
        <Link href="/" className="ambil-logo">
          ShareFood
        </Link>
        <div className="ambil-nav-links">
          <button
            className={`ambil-nav-btn ${activeTab === 'gratis' ? 'active' : ''}`}
            onClick={() => setActiveTab('gratis')}
          >
            🎁 Makanan Gratis
          </button>
          <button
            className={`ambil-nav-btn ${activeTab === 'berbayar' ? 'active' : ''}`}
            onClick={() => setActiveTab('berbayar')}
          >
            🏷️ Menu Berbayar
          </button>
          <button
            className={`ambil-nav-btn ${activeTab === 'notifikasi' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifikasi')}
          >
            🔔 Notifikasi & Status
          </button>
          <button
            className={`ambil-nav-btn ${activeTab === 'riwayat' ? 'active' : ''}`}
            onClick={() => setActiveTab('riwayat')}
          >
            📜 Riwayat
          </button>
          <Link href="/profil-penerima" className="ambil-nav-btn">
            👤 Profil Saya
          </Link>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="ambil-mobile-nav">
        <button
          className={`ambil-mobile-nav-btn ${activeTab === 'gratis' ? 'active' : ''}`}
          onClick={() => setActiveTab('gratis')}
        >
          <span>🎁</span>Gratis
        </button>
        <button
          className={`ambil-mobile-nav-btn ${activeTab === 'berbayar' ? 'active' : ''}`}
          onClick={() => setActiveTab('berbayar')}
        >
          <span>🏷️</span>Berbayar
        </button>
        <button
          className={`ambil-mobile-nav-btn ${activeTab === 'notifikasi' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifikasi')}
        >
          <span>🔔</span>Status
        </button>
        <button
          className={`ambil-mobile-nav-btn ${activeTab === 'riwayat' ? 'active' : ''}`}
          onClick={() => setActiveTab('riwayat')}
        >
          <span>📜</span>Riwayat
        </button>
        <Link href="/profil-penerima" className="ambil-mobile-nav-btn">
          <span>👤</span>Profil
        </Link>
      </div>

      {/* MAIN CONTAINER */}
      <main className="container">
        {/* TAB 1: MAKANAN GRATIS */}
        {activeTab === 'gratis' && (
          <section id="tab-gratis" className="tab-content active">
            <div className="toolbar">
              <h2>Makanan Gratis Sekitar</h2>
              <div className="filter-wrapper">
                <input
                  type="text"
                  id="search-gratis"
                  className="search-input"
                  placeholder="Cari nama makanan..."
                  value={searchGratis}
                  onChange={(e) => setSearchGratis(e.target.value)}
                />
                <select
                  id="radius-gratis"
                  className="select-input"
                  value={radiusGratis}
                  onChange={(e) => setRadiusGratis(e.target.value)}
                >
                  <option value="all">Semua Jarak</option>
                  <option value="1">1 km</option>
                  <option value="3">3 km</option>
                  <option value="5">5 km</option>
                </select>
              </div>
            </div>

            {gratisFoods.length === 0 ? (
              <div id="empty-gratis" className="empty-state">
                <div className="empty-icon">🍃</div>
                <h3>Belum Ada Makanan Gratis</h3>
                <p>Tidak ada makanan gratis pada kata kunci atau radius ini.</p>
              </div>
            ) : (
              <div className="food-grid" id="grid-gratis">
                {gratisFoods.map((item) => (
                  <div key={item.id} className="food-card">
                    <img
                      src={
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                      }
                      className="food-img"
                      alt={item.title}
                    />
                    <div className="food-body">
                      <div>
                        <div className="store-name">
                          👤 {item.ownerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '0.3rem' }}>
                          📍 Patokan: {item.addressNote || item.areaLabel}
                        </div>
                        <h3 className="food-title">{item.title}</h3>
                        <div className="food-info">
                          Sisa {item.quantity} porsi &bull; Ambil s/d {item.pickupDeadline}
                          {item.distanceKm !== null && (
                            <> &bull; <strong>{item.distanceKm.toFixed(1)} km</strong></>
                          )}
                        </div>
                        <div className="price-free">Rp 0 (Gratis)</div>
                      </div>
                      <button
                        className="btn btn-green"
                        disabled={(Boolean(user?.id) && item.userId === user?.id) || isDailyFreeLimitReached}
                        style={
                          (Boolean(user?.id) && item.userId === user?.id) || isDailyFreeLimitReached
                            ? { backgroundColor: '#CCCCCC', color: '#666666', cursor: 'not-allowed' }
                            : undefined
                        }
                        onClick={() => openModal(item)}
                      >
                        {Boolean(user?.id) && item.userId === user?.id
                          ? 'Produk Anda Sendiri'
                          : isDailyFreeLimitReached
                          ? 'Batas Harian (3/3) • Besok Lagi'
                          : 'Ambil Gratis'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: MENU BERBAYAR */}
        {activeTab === 'berbayar' && (
          <section id="tab-berbayar" className="tab-content active">
            <div className="toolbar">
              <h2>Menu Toko Berbayar (Self-Pickup)</h2>
              <div className="filter-wrapper">
                <input
                  type="text"
                  id="search-berbayar"
                  className="search-input"
                  placeholder="Cari menu toko..."
                  value={searchBerbayar}
                  onChange={(e) => setSearchBerbayar(e.target.value)}
                />
                <select
                  id="radius-berbayar"
                  className="select-input"
                  value={radiusBerbayar}
                  onChange={(e) => setRadiusBerbayar(e.target.value)}
                >
                  <option value="all">Semua Jarak</option>
                  <option value="1">1 km</option>
                  <option value="3">3 km</option>
                  <option value="5">5 km</option>
                </select>
              </div>
            </div>

            {berbayarFoods.length === 0 ? (
              <div id="empty-berbayar" className="empty-state">
                <div className="empty-icon">🏪</div>
                <h3>Toko Tidak Ditemukan</h3>
                <p>Tidak ada menu toko pada kata kunci atau radius ini.</p>
              </div>
            ) : (
              <div className="food-grid" id="grid-berbayar">
                {berbayarFoods.map((item) => (
                  <div key={item.id} className="food-card">
                    <img
                      src={
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
                      }
                      className="food-img"
                      alt={item.title}
                    />
                    <div className="food-body">
                      <div>
                        <div className="store-name">
                          🏪 {item.ownerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '0.3rem' }}>
                          📍 Patokan: {item.addressNote || item.areaLabel}
                        </div>
                        <h3 className="food-title">{item.title}</h3>
                        <div className="food-info">
                          Sisa {item.quantity} porsi &bull; Ambil s/d {item.pickupDeadline}
                          {item.distanceKm !== null && (
                            <> &bull; <strong>{item.distanceKm.toFixed(1)} km</strong></>
                          )}
                        </div>
                        <div className="price-tag">
                          Rp {Number(item.price || 15000).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <button
                        className="btn btn-orange"
                        disabled={Boolean(user?.id) && item.userId === user?.id}
                        style={
                          Boolean(user?.id) && item.userId === user?.id
                            ? { backgroundColor: '#CCCCCC', color: '#666666', cursor: 'not-allowed' }
                            : undefined
                        }
                        onClick={() => openModal(item)}
                      >
                        {Boolean(user?.id) && item.userId === user?.id
                          ? 'Produk Anda Sendiri'
                          : 'Pesan / Beli'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: NOTIFIKASI & STATUS */}
        {activeTab === 'notifikasi' && (
          <section id="tab-notifikasi" className="tab-content active">
            <div className="toolbar">
              <h2>Notifikasi &amp; Status Pesanan</h2>
            </div>
            <div className="list-container" id="container-notifikasi">
              {notifikasiMyRequests.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                  Belum ada notifikasi atau status pesanan aktif.
                </p>
              ) : (
                notifikasiMyRequests.map((r) => {
                  const targetFood = foods.find((f) => f.id === r.foodId);
                  const isPaid = targetFood?.type === 'berbayar' || targetFood?.category === 'berbayar' || r.foodCategory === 'berbayar';
                  const patokan = targetFood?.addressNote || targetFood?.areaLabel || targetFood?.pickupDetails?.landmark || 'Lokasi Toko';
                  const rawPhone = targetFood?.whatsappNumber || targetFood?.pickupDetails?.contactPhone || '081234567890';
                  const waPhone = rawPhone.replace(/^0/, '62').replace(/[^\d]/g, '');
                  const mapsUrl = targetFood?.mapsUrl || targetFood?.pickupDetails?.fullAddress || 'https://maps.google.com';
                  const safeMapsUrl = mapsUrl.startsWith('http') ? mapsUrl : `https://maps.google.com/?q=${encodeURIComponent(patokan)}`;

                  // Status 1: PENDING (Sedang Diproses Penjual)
                  if (r.status === 'PENDING') {
                    return (
                      <div key={r.id} className="status-card" style={{ borderLeft: '5px solid #E65100' }}>
                        <div className="status-header">
                          <span className="status-title">{isPaid ? '🏷️' : '🥪'} {r.foodTitle || targetFood?.title || 'Pesanan Makanan'}</span>
                          <span className="badge badge-pending">Sedang Diproses Penjual</span>
                        </div>
                        <div className="status-detail">
                          <strong>Status:</strong> Pesanan Anda sedang menunggu konfirmasi dari pemilik. Mohon tunggu sebentar.<br />
                          📍 <strong>Patokan:</strong> {patokan}
                        </div>
                        <div className="status-time">Meminta konfirmasi &bull; {r.createdAt}</div>
                        <div className="action-btn-group">
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo, saya menunggu konfirmasi ${r.foodTitle || 'pesanan'} di ShareFood.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action btn-wa"
                          >
                            💬 Tanya via WA
                          </a>
                        </div>
                      </div>
                    );
                  }

                  // Status 2: DECLINED / CANCELLED (Dibatalkan Penjual)
                  if (r.status === 'DECLINED' || r.status === 'CANCELLED') {
                    return (
                      <div key={r.id} className="status-card" style={{ borderLeft: '5px solid #C62828' }}>
                        <div className="status-header">
                          <span className="status-title">🍲 {r.foodTitle || targetFood?.title || 'Pesanan Makanan'}</span>
                          <span className="badge badge-canceled">Dibatalkan Penjual</span>
                        </div>
                        <div className="status-detail">
                          <strong>Status:</strong> Maaf, pesanan telah dibatalkan oleh penjual.<br />
                          📍 <strong>Patokan:</strong> {patokan}
                        </div>
                        <div className="status-time">Diperbarui: {r.respondedAt || r.createdAt}</div>
                      </div>
                    );
                  }

                  // Status 4: APPROVED + BERBAYAR (Pesanan Diterima)
                  if (r.status === 'APPROVED' && isPaid) {
                    const priceVal = Number(targetFood?.price || 15000);
                    return (
                      <div key={r.id} className="status-card" style={{ borderLeft: '5px solid #1565C0' }}>
                        <div className="status-header">
                          <span className="status-title">☕ {r.foodTitle || targetFood?.title || 'Menu Berbayar'}</span>
                          <span className="badge badge-paid">Pesanan Diterima</span>
                        </div>
                        <div className="status-detail">
                          <strong>Status:</strong> Pesanan makanan Anda diterima, silahkan bisa lanjutkan proses pemesanan.<br />
                          🏷️ <strong>Total:</strong> Rp {priceVal.toLocaleString('id-ID')} &bull; 📍 <strong>Patokan:</strong> {patokan}
                        </div>
                        <div className="status-time">Diterima: {r.respondedAt || r.createdAt}</div>
                        <div className="action-btn-group">
                          <button
                            onClick={() => setQrisModalFood(targetFood || { title: r.foodTitle, price: priceVal })}
                            className="btn-action btn-qris-action"
                          >
                            💳 Lihat QRIS
                          </button>
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo, saya sudah pesan ${r.foodTitle || 'menu'} di ShareFood.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action btn-wa"
                          >
                            💬 Chat WA Toko
                          </a>
                          <a
                            href={safeMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action btn-gmaps"
                          >
                            🗺️ Rute GMaps
                          </a>
                        </div>
                      </div>
                    );
                  }

                  // Status 3: APPROVED + GRATIS (Pesanan Dikonfirmasi)
                  return (
                    <div key={r.id} className="status-card" style={{ borderLeft: '5px solid #2E7D32' }}>
                      <div className="status-header">
                        <span className="status-title">🍱 {r.foodTitle || targetFood?.title || 'Makanan Gratis'}</span>
                        <span className="badge badge-approved">Pesanan Dikonfirmasi</span>
                      </div>
                      <div className="status-detail">
                        <strong>Status:</strong> Pesanan Anda dikonfirmasi! Silakan ambil ke lokasi sesuai patokan.<br />
                        📍 <strong>Patokan:</strong> {patokan}
                      </div>
                      <div className="status-time">Dikonfirmasi: {r.respondedAt || r.createdAt}</div>
                      <div className="action-btn-group">
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo, saya mau ambil ${r.foodTitle || 'makanan'} dari ShareFood.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-action btn-wa"
                        >
                          💬 Chat WA Pemilik
                        </a>
                        <a
                          href={safeMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-action btn-gmaps"
                        >
                          📍 Lokasi GMaps
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* TAB 4: RIWAYAT */}
        {activeTab === 'riwayat' && (
          <section id="tab-riwayat" className="tab-content active">
            <div className="toolbar">
              <h2>Riwayat Pengambilan &amp; Pembelian</h2>
            </div>
            <div className="list-container" id="container-riwayat">
              {finishedMyRequests.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
                  Belum ada riwayat transaksi selesai.
                </p>
              ) : (
                finishedMyRequests.map((r) => {
                  const targetFood = foods.find((f) => f.id === r.foodId);
                  const isPaid = targetFood?.type === 'berbayar' || targetFood?.category === 'berbayar' || r.foodCategory === 'berbayar';
                  const patokan = targetFood?.addressNote || targetFood?.areaLabel || 'Lokasi Toko';
                  const priceLabel = isPaid
                    ? `Rp ${Number(targetFood?.price || 15000).toLocaleString('id-ID')}`
                    : 'Rp 0 (Gratis)';

                  return (
                    <div key={r.id} className="status-card" style={{ borderLeft: '5px solid #455A64' }}>
                      <div className="status-header">
                        <span className="status-title">🍛 {r.foodTitle || 'Transaksi Selesai'}</span>
                        <span className="badge" style={{ background: '#ECEFF1', color: '#455A64' }}>
                          Selesai
                        </span>
                      </div>
                      <div className="status-detail">
                        📍 Patokan: {patokan} &bull; {priceLabel}
                      </div>
                      <div className="status-time">Selesai pada: {r.respondedAt || r.createdAt}</div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </main>

      {/* POP-UP CONFIRMATION MODAL (Exact baru/ambil-makanan.html) */}
      {modalOpen && selectedFood && (
        <div
          id="order-modal"
          className="modal"
          style={{ display: 'flex' }}
          onClick={closeModal}
        >
          <div
            className="modal-content"
            style={{ position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-box-alert">
              <div className="modal-icon-wait">⏳</div>
              <h3 id="modal-title" style={{ color: '#6B1D2F', marginBottom: '0.75rem' }}>
                {selectedFood.type === 'berbayar' || selectedFood.category === 'berbayar'
                  ? 'Pesan Menu Berbayar'
                  : 'Ambil Makanan Gratis'}
              </h3>
              <p id="modal-desc" style={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Pesanan Anda sedang menunggu konfirmasi dari pemilik. Silahkan bisa cek Notifikasi &amp; Status untuk info lebih lanjut.
              </p>
              <button
                className="btn btn-green"
                style={{ width: '100%', padding: '0.75rem' }}
                onClick={handleConfirmOrder}
                disabled={isOrdering}
              >
                {isOrdering ? 'Mengirim...' : 'Paham, Cek Status Pesanan ➔'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIEW QRIS (KHUSUS BERBAYAR) */}
      {qrisModalFood && (
        <div
          id="qris-modal"
          className="modal"
          style={{ display: 'flex' }}
          onClick={() => setQrisModalFood(null)}
        >
          <div
            className="modal-content"
            style={{ textAlign: 'center', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="qris-title" style={{ color: '#6B1D2F' }}>
              QRIS - {qrisModalFood.title}
            </h3>
            <p id="qris-price" style={{ marginBottom: '1rem', fontWeight: 600 }}>
              Total Tagihan: Rp {Number(qrisModalFood.price || 15000).toLocaleString('id-ID')}
            </p>

            <div
              style={{
                width: '180px',
                height: '180px',
                background: '#FFF',
                border: '2px solid #6B1D2F',
                borderRadius: '10px',
                margin: '0 auto 1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#6B1D2F',
                overflow: 'hidden',
              }}
            >
              {qrisModalFood.qrisUrl ? (
                <img
                  src={qrisModalFood.qrisUrl}
                  alt="QRIS"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '[ SCAN QRIS TOKO ]'
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.25rem' }}>
              Silakan scan QRIS di atas menggunakan E-Wallet / Mobile Banking Anda.
            </p>

            <button
              className="btn btn-orange"
              style={{ width: '100%' }}
              onClick={() => setQrisModalFood(null)}
            >
              Tutup QRIS
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        &copy; ShareFood — Kurangi Sampah Makanan, Bantu Sesama.
      </footer>
    </div>
  );
}

export default function AmbilMakananPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#888888]">Memuat halaman...</div>}>
      <AmbilMakananContent />
    </Suspense>
  );
}
