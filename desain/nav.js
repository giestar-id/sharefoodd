/**
 * ShareFood Prototype Navigation & Responsive Engine
 * Menghubungkan 17 layar dan mengaktifkan layout adaptif responsif (Desktop, Tablet, Mobile)
 * Sesuai panduan PRD ShareFood Bab 5 & 12 (Mobile Bottom Nav, Drawer, Touch Targets >= 44px).
 */
(function() {
  const SCREEN_LIST = [
    { id: 's1', group: 'Publik', name: 'Beranda', path: './s1_beranda.html' },
    { id: 's2', group: 'Publik', name: 'Daftar Makanan', path: './s2_daftar_makanan_makanan.html' },
    { id: 's3', group: 'Publik', name: 'Detail Makanan', path: './s3_detail_makanan_modal_makanan_food.html' },
    { id: 's4', group: 'Publik', name: 'Modal Ambil Makanan', path: './s4_modal_ambil_makanan_dialog.html' },
    { id: 's5', group: 'Publik', name: 'Panduan Keamanan', path: './s5_panduan_keamanan_panduan.html' },
    { id: 's6', group: 'Autentikasi', name: 'Login', path: './s6_login_login.html' },
    { id: 's7', group: 'Autentikasi', name: 'Register', path: './s7_register_register.html' },
    { id: 's11', group: 'Dashboard', name: 'Ringkasan Dashboard', path: './s11_dashboard_ringkasan_dashboard.html' },
    { id: 's12', group: 'Form Postingan', name: 'Bagikan Makanan', path: './s12_modal_bagikan_makanan_makanan_buat.html' },
    { id: 's13', group: 'Dashboard Donatur', name: 'Makanan Saya', path: './s13_makanan_saya_dashboard_makanan_saya.html' },
    { id: 's14', group: 'Form Postingan', name: 'Edit Makanan', path: './s14_modal_edit_makanan_makanan_food_edit.html' },
    { id: 's15', group: 'Dashboard Donatur', name: 'Detail Makanan Saya', path: './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html' },
    { id: 's18', group: 'Dashboard Penerima', name: 'Makanan Diambil', path: './s18_makanan_diambil_dashboard_makanan_diambil.html' },
    { id: 's19', group: 'Dashboard Penerima', name: 'Detail Makanan Diambil', path: './s19_detail_makanan_diambil_approved_dashboard_makanan_diambil_request.html' },
    { id: 's22', group: 'Dashboard Donatur', name: 'Permintaan Masuk', path: './s22_permintaan_masuk_dashboard_permintaan_masuk.html' },
    { id: 's24', group: 'Akun & Riwayat', name: 'Riwayat Transaksi', path: './s24_riwayat_dashboard_riwayat.html' },
    { id: 's25', group: 'Akun & Riwayat', name: 'Profil & Pengaturan', path: './s25_profil_dan_pengaturan_dashboard_profil.html' }
  ];

  const PATH_MAP = {
    'beranda': './s1_beranda.html',
    'lihat-makanan': './s2_daftar_makanan_makanan.html',
    'makanan': './s2_daftar_makanan_makanan.html',
    'detail-makanan': './s3_detail_makanan_modal_makanan_food.html',
    'ambil-makanan': './s4_modal_ambil_makanan_dialog.html',
    'panduan': './s5_panduan_keamanan_panduan.html',
    'panduan-keamanan': './s5_panduan_keamanan_panduan.html',
    'ketentuan-komunitas': './s5_panduan_keamanan_panduan.html',
    'masuk': './s6_login_login.html',
    'login': './s6_login_login.html',
    'daftar': './s7_register_register.html',
    'register': './s7_register_register.html',
    'ringkasan': './s11_dashboard_ringkasan_dashboard.html',
    'dashboard': './s11_dashboard_ringkasan_dashboard.html',
    'bagikan-makanan': './s12_modal_bagikan_makanan_makanan_buat.html',
    'makanan-buat': './s12_modal_bagikan_makanan_makanan_buat.html',
    'makanan-saya': './s13_makanan_saya_dashboard_makanan_saya.html',
    'edit-makanan': './s14_modal_edit_makanan_makanan_food_edit.html',
    'detail-makanan-saya': './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html',
    'detail-makanan-saya-available': './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html',
    'makanan-diambil': './s18_makanan_diambil_dashboard_makanan_diambil.html',
    'detail-diambil': './s19_detail_makanan_diambil_approved_dashboard_makanan_diambil_request.html',
    'detail-diambil-approved': './s19_detail_makanan_diambil_approved_dashboard_makanan_diambil_request.html',
    'permintaan-masuk': './s22_permintaan_masuk_dashboard_permintaan_masuk.html',
    'riwayat': './s24_riwayat_dashboard_riwayat.html',
    'profil': './s25_profil_dan_pengaturan_dashboard_profil.html'
  };

  function getCurrentFile() {
    const parts = window.location.pathname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || '';
  }

  // 1. Inisialisasi Tautan Navigasi Antar-Layar
  function initLinks() {
    const file = getCurrentFile();

    // Data-path listener
    document.querySelectorAll('[data-path]').forEach(el => {
      const p = el.getAttribute('data-path');
      if (PATH_MAP[p]) {
        el.setAttribute('href', PATH_MAP[p]);
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = PATH_MAP[p];
        });
      }
    });

    // Logo Brand Header -> Beranda
    document.querySelectorAll('header img[alt*="Logo"], header span').forEach(el => {
      if (el.textContent.trim().includes('ShareFood') || el.alt?.includes('Logo')) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => window.location.href = './s1_beranda.html');
      }
    });
    const headerBrand = document.querySelector('header .flex.items-center.gap-space-sm');
    if (headerBrand) {
      headerBrand.style.cursor = 'pointer';
      headerBrand.addEventListener('click', () => window.location.href = './s1_beranda.html');
    }

    // Avatar Profile Header -> Dashboard
    const avatar = document.querySelector('header .rounded-full.bg-primary');
    if (avatar) {
      avatar.style.cursor = 'pointer';
      avatar.setAttribute('title', 'Buka Dashboard');
      avatar.addEventListener('click', () => window.location.href = './s11_dashboard_ringkasan_dashboard.html');
    }

    // Kontekstual Per Halaman
    if (file.includes('s1_beranda')) {
      document.querySelectorAll('a, button').forEach(el => {
        const text = el.textContent.trim().toLowerCase();
        if (text.includes('lihat makanan')) {
          el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = './s2_daftar_makanan_makanan.html'; });
        } else if (text.includes('bagikan makanan')) {
          el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = './s12_modal_bagikan_makanan_makanan_buat.html'; });
        }
      });
      document.querySelectorAll('main article, main .rounded-\\[24px\\]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.location.href = './s3_detail_makanan_modal_makanan_food.html');
      });
    }

    if (file.includes('s2_daftar_makanan')) {
      document.querySelectorAll('article').forEach(card => {
        const btnAmbil = card.querySelector('button');
        if (btnAmbil) {
          btnAmbil.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = './s4_modal_ambil_makanan_dialog.html';
          });
        }
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.location.href = './s3_detail_makanan_modal_makanan_food.html');
      });
    }

    if (file.includes('s3_detail_makanan_modal')) {
      const closeBtn = document.getElementById('modal-close-icon');
      const cancelBtn = document.getElementById('modal-cancel-btn');
      const claimBtn = document.getElementById('modal-claim-btn');
      if (closeBtn) closeBtn.onclick = () => window.location.href = './s2_daftar_makanan_makanan.html';
      if (cancelBtn) cancelBtn.onclick = () => window.location.href = './s2_daftar_makanan_makanan.html';
      if (claimBtn) claimBtn.onclick = () => window.location.href = './s4_modal_ambil_makanan_dialog.html';
    }

    if (file.includes('s4_modal_ambil_makanan')) {
      document.querySelectorAll('button').forEach(btn => {
        const txt = btn.textContent.trim().toLowerCase();
        if (txt.includes('batal') || btn.querySelector('.material-symbols-outlined')?.textContent.trim() === 'close') {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s3_detail_makanan_modal_makanan_food.html'; };
        } else if (txt.includes('kirim') || txt.includes('ambil') || txt.includes('ajukan')) {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s19_detail_makanan_diambil_approved_dashboard_makanan_diambil_request.html'; };
        }
      });
    }

    if (file.includes('s6_login')) {
      const submitBtn = document.querySelector('button[type="submit"]') || document.querySelector('button');
      if (submitBtn) submitBtn.onclick = (e) => { e.preventDefault(); window.location.href = './s11_dashboard_ringkasan_dashboard.html'; };
      document.querySelectorAll('a').forEach(a => {
        if (a.textContent.toLowerCase().includes('daftar')) {
          a.onclick = (e) => { e.preventDefault(); window.location.href = './s7_register_register.html'; };
        }
      });
    }

    if (file.includes('s7_register')) {
      const submitBtn = document.querySelector('button[type="submit"]') || document.querySelector('button');
      if (submitBtn) submitBtn.onclick = (e) => { e.preventDefault(); window.location.href = './s11_dashboard_ringkasan_dashboard.html'; };
      document.querySelectorAll('a').forEach(a => {
        if (a.textContent.toLowerCase().includes('masuk')) {
          a.onclick = (e) => { e.preventDefault(); window.location.href = './s6_login_login.html'; };
        }
      });
    }

    if (file.includes('s12_modal_bagikan')) {
      document.querySelectorAll('button').forEach(btn => {
        const txt = btn.textContent.trim().toLowerCase();
        if (txt.includes('batal') || btn.querySelector('.material-symbols-outlined')?.textContent.trim() === 'close') {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s13_makanan_saya_dashboard_makanan_saya.html'; };
        } else if (txt.includes('bagikan') || txt.includes('posting') || txt.includes('simpan')) {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html'; };
        }
      });
    }

    if (file.includes('s13_makanan_saya')) {
      document.querySelectorAll('button, a').forEach(el => {
        if (el.textContent.toLowerCase().includes('bagikan') || el.textContent.toLowerCase().includes('donasi baru')) {
          el.onclick = (e) => { e.preventDefault(); window.location.href = './s12_modal_bagikan_makanan_makanan_buat.html'; };
        }
      });
      document.querySelectorAll('article, tr, .rounded-xl, .rounded-2xl').forEach(card => {
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html';
      });
    }

    if (file.includes('s14_modal_edit')) {
      document.querySelectorAll('button').forEach(btn => {
        const txt = btn.textContent.trim().toLowerCase();
        if (txt.includes('batal') || btn.querySelector('.material-symbols-outlined')?.textContent.trim() === 'close') {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html'; };
        } else if (txt.includes('simpan') || txt.includes('perbarui')) {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html'; };
        }
      });
    }

    if (file.includes('s15_detail_makanan_saya')) {
      document.querySelectorAll('button, a').forEach(el => {
        const txt = el.textContent.trim().toLowerCase();
        if (txt.includes('edit')) {
          el.onclick = (e) => { e.preventDefault(); window.location.href = './s14_modal_edit_makanan_makanan_food_edit.html'; };
        } else if (txt.includes('kembali')) {
          el.onclick = (e) => { e.preventDefault(); window.location.href = './s13_makanan_saya_dashboard_makanan_saya.html'; };
        }
      });
    }

    if (file.includes('s18_makanan_diambil')) {
      document.querySelectorAll('article, tr, .rounded-xl, .rounded-2xl').forEach(card => {
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = './s19_detail_makanan_diambil_approved_dashboard_makanan_diambil_request.html';
      });
    }

    if (file.includes('s19_detail_makanan_diambil')) {
      document.querySelectorAll('button, a').forEach(el => {
        if (el.textContent.toLowerCase().includes('kembali')) {
          el.onclick = (e) => { e.preventDefault(); window.location.href = './s18_makanan_diambil_dashboard_makanan_diambil.html'; };
        }
      });
    }

    if (file.includes('s22_permintaan_masuk')) {
      document.querySelectorAll('button').forEach(btn => {
        const txt = btn.textContent.trim().toLowerCase();
        if (txt.includes('setujui') || txt.includes('terima')) {
          btn.onclick = (e) => { e.preventDefault(); window.location.href = './s15_detail_makanan_saya_available_dashboard_makanan_saya_food.html'; };
        }
      });
    }
  }

  // 2. Responsive Engine: Mobile Drawer, Backdrop & Hamburger Toggle
  function initResponsiveLayout() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    if (sidebar) {
      // Buat backdrop jika belum ada
      let backdrop = document.getElementById('sidebar-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebar-backdrop';
        backdrop.className = 'fixed inset-0 bg-[#0A2617]/60 backdrop-blur-xs z-40 hidden lg:hidden transition-opacity';
        document.body.appendChild(backdrop);
      }

      function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
      }

      function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isClosed = sidebar.classList.contains('-translate-x-full');
          if (isClosed) openSidebar(); else closeSidebar();
        });
      }

      backdrop.addEventListener('click', closeSidebar);

      // Tutup drawer bila klik link di mobile
      sidebar.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          if (window.innerWidth < 1024) closeSidebar();
        });
      });

      // Tutup via keyboard ESC
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
      });
    }

    // Tambahkan padding bawah di main untuk layar mobile agar konten tidak tertutup bottom nav
    const mainEl = document.querySelector('main');
    if (mainEl && !mainEl.classList.contains('pb-20')) {
      mainEl.classList.add('pb-24', 'lg:pb-8');
    }
  }

  // 3. Mobile Bottom Navigation Bar (PRD Bab 5: Beranda, Makanan, Bagikan (+), Dashboard)
  function injectMobileBottomNav() {
    if (document.getElementById('sf-mobile-bottom-nav')) return;

    const file = getCurrentFile();
    const isBeranda = file.includes('s1_beranda');
    const isMakanan = file.includes('s2_daftar_makanan') || file.includes('s3_detail');
    const isBagikan = file.includes('s12_modal_bagikan');
    const isDashboard = file.includes('s11_') || file.includes('s13_') || file.includes('s15_') || file.includes('s18_') || file.includes('s19_') || file.includes('s22_') || file.includes('s24_') || file.includes('s25_');

    const bottomNav = document.createElement('nav');
    bottomNav.id = 'sf-mobile-bottom-nav';
    bottomNav.className = 'lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline h-16 flex items-center justify-around px-2 shadow-lg';

    bottomNav.innerHTML = `
      <a href="./s1_beranda.html" class="flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${isBeranda ? 'text-primary font-bold' : 'text-on-surface-muted hover:text-on-surface'}">
        <span class="material-symbols-outlined text-[22px]">home</span>
        <span class="text-[10px] tracking-tight mt-0.5">Beranda</span>
      </a>
      <a href="./s2_daftar_makanan_makanan.html" class="flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${isMakanan ? 'text-primary font-bold' : 'text-on-surface-muted hover:text-on-surface'}">
        <span class="material-symbols-outlined text-[22px]">search</span>
        <span class="text-[10px] tracking-tight mt-0.5">Makanan</span>
      </a>
      <a href="./s12_modal_bagikan_makanan_makanan_buat.html" class="flex flex-col items-center justify-center -mt-5">
        <div class="w-12 h-12 rounded-full bg-primary hover:bg-primary-pressed text-white flex items-center justify-center shadow-lg transition-transform active:scale-95">
          <span class="material-symbols-outlined text-[26px]">add</span>
        </div>
        <span class="text-[10px] font-semibold text-primary mt-1">Bagikan</span>
      </a>
      <a href="./s11_dashboard_ringkasan_dashboard.html" class="flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${isDashboard ? 'text-primary font-bold' : 'text-on-surface-muted hover:text-on-surface'}">
        <span class="material-symbols-outlined text-[22px]">dashboard</span>
        <span class="text-[10px] tracking-tight mt-0.5">Dashboard</span>
      </a>
      <a href="./s25_profil_dan_pengaturan_dashboard_profil.html" class="flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${file.includes('s25_') ? 'text-primary font-bold' : 'text-on-surface-muted hover:text-on-surface'}">
        <span class="material-symbols-outlined text-[22px]">person</span>
        <span class="text-[10px] tracking-tight mt-0.5">Profil</span>
      </a>
    `;

    document.body.appendChild(bottomNav);
  }

  // 4. Floating Quick Switcher Widget (Desktop & Mobile Adaptive)
  function injectFloatingWidget() {
    if (document.getElementById('sharefood-prototype-nav')) return;

    const curFile = getCurrentFile();
    let currentScreen = SCREEN_LIST.find(s => curFile.includes(s.id)) || { id: 's?', name: 'Layar Desain' };

    const widget = document.createElement('div');
    widget.id = 'sharefood-prototype-nav';
    widget.style.cssText = `
      position: fixed;
      bottom: 76px;
      right: 16px;
      z-index: 99999;
      font-family: 'Montserrat', system-ui, sans-serif;
    `;

    // Pada desktop di pojok bawah (bottom: 16px)
    if (window.innerWidth >= 1024) {
      widget.style.bottom = '16px';
    }

    widget.innerHTML = `
      <div style="background: rgba(10, 38, 23, 0.94); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.18); border-radius: 9999px; padding: 6px 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35); color: #fff; font-size: 13px;">
        <a href="./index.html" title="Kembali ke Galeri Hub Desain" style="display: flex; align-items: center; gap: 4px; color: #7cd9a7; text-decoration: none; font-weight: 600; padding-right: 6px; border-right: 1px solid rgba(255,255,255,0.2);">
          <span class="material-symbols-outlined" style="font-size: 16px;">apps</span>
          <span class="hidden sm:inline">Hub Desain</span>
        </a>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="background: #23865B; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">${currentScreen.id.toUpperCase()}</span>
          <select id="sf-screen-switcher" style="background: transparent; color: #fff; border: none; font-size: 12px; font-weight: 500; cursor: pointer; outline: none; max-width: 140px;">
            ${SCREEN_LIST.map(s => `
              <option value="${s.path}" ${curFile.includes(s.id) ? 'selected' : ''} style="background: #0A2617; color: #fff;">
                [${s.id}] ${s.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    const switcher = document.getElementById('sf-screen-switcher');
    if (switcher) {
      switcher.addEventListener('change', function() {
        if (this.value) window.location.href = this.value;
      });
    }

    // Adaptasi posisi saat resize layar
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        widget.style.bottom = '16px';
      } else {
        widget.style.bottom = '76px';
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initLinks();
    initResponsiveLayout();
    injectMobileBottomNav();
    injectFloatingWidget();
  });
})();
