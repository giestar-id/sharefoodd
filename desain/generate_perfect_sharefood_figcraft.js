const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== STARTING PERFECT HIGH-FIDELITY FIGCRAFT GENERATOR FOR SHAREFOOD ===');

// Color Palette Helpers (0 - 1 RGBA)
const hexToRgb = (hex, alpha = 1) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
    a: alpha
  };
};

const C = {
  primary: hexToRgb('#006C45'),          // #006C45 Dark Forest Green Brand
  primaryHover: hexToRgb('#005334'),     // #005334 Deeper Forest Green
  primaryContainer: hexToRgb('#23865B'),  // #23865B Leaf Green Action Button
  primaryLight: hexToRgb('#D8F2E5'),      // #D8F2E5 Badge Pill Light Green
  primaryTint: hexToRgb('#F0FDF4'),       // #F0FDF4 Very Soft Green Card Background
  surface: hexToRgb('#FFFFFF'),           // #FFFFFF Pure White
  background: hexToRgb('#F8FAF8'),        // #F8FAF8 Light Canvas Background
  textDark: hexToRgb('#0A2617'),          // #0A2617 Deep Charcoal Heading
  textMuted: hexToRgb('#526056'),         // #526056 Muted Subtitle & Body
  textLight: hexToRgb('#8A9890'),         // #8A9890 Placeholder Text
  border: hexToRgb('#E3EAE5'),            // #E3EAE5 Card Outer Border
  borderLight: hexToRgb('#EEF2EE'),       // #EEF2EE Subtle Sub-border
  white: hexToRgb('#FFFFFF'),
  success: hexToRgb('#23865B'),           // #23865B Emerald Green
  successBg: hexToRgb('#D8F2E5'),         // #D8F2E5
  warning: hexToRgb('#B26A00'),           // #B26A00 Amber Warning
  warningBg: hexToRgb('#FEF3C7'),         // #FEF3C7
  danger: hexToRgb('#C94B45'),            // #C94B45 Red Error
  dangerBg: hexToRgb('#FEE2E2'),          // #FEE2E2
  scrim: { r: 10/255, g: 38/255, b: 23/255, a: 0.45 }, // Subtle 45% scrim so page underneath is visible!
  
  // Thematic Image Gradients
  bakeryBg: hexToRgb('#F7EFE6'),
  bentoBg: hexToRgb('#FCEADE'),
  veggieBg: hexToRgb('#E6F4EA'),
  juiceBg: hexToRgb('#FEF3D6'),
  fruitBg: hexToRgb('#FDE8E8'),
  grainBg: hexToRgb('#ECEFF1'),
  drinkBg: hexToRgb('#E1F5FE'),
  soupBg: hexToRgb('#FFF3E0')
};

// Global Node Registry & ID Counter
let nextId = 1000;
const nodes = {};

function registerNode(node) {
  nodes[String(node.id)] = node;
  return node.id;
}

function createPage(id, name) {
  return registerNode({
    id: id,
    name: name,
    type: 'page',
    background: C.background,
    children: [],
    flows: [],
    width: 0,
    height: 0,
    prototype: {
      background: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
      device: 'None',
      rotation: 'portrait'
    }
  });
}

function addChild(parentId, childId) {
  if (nodes[String(parentId)]) {
    if (!nodes[String(parentId)].children) nodes[String(parentId)].children = [];
    nodes[String(parentId)].children.push(childId);
  }
}

function createFrame(parentId, name, x, y, width, height, bg = C.surface, cornerRadius = 0) {
  const id = ++nextId;
  const node = {
    id: id,
    parent: parentId,
    name: name,
    type: 'frame',
    transform: [1, 0, 0, 1, x, y],
    width: width,
    height: height,
    children: [],
    fills: [{
      type: 'solid',
      color: bg,
      opacity: bg.a ?? 1,
      visible: true,
      blend: 'normal'
    }]
  };
  if (cornerRadius > 0) {
    node.corners = {
      radii: [cornerRadius, cornerRadius, cornerRadius, cornerRadius],
      smoothing: 0
    };
  }
  registerNode(node);
  addChild(parentId, id);
  return id;
}

function createRect(parentId, name, x, y, width, height, fill = C.surface, cornerRadius = 0, stroke = null) {
  const id = ++nextId;
  const node = {
    id: id,
    parent: parentId,
    name: name,
    type: 'rectangle',
    transform: [1, 0, 0, 1, x, y],
    width: width,
    height: height,
    fills: fill ? [{
      type: 'solid',
      color: fill,
      opacity: fill.a ?? 1,
      visible: true,
      blend: 'normal'
    }] : []
  };
  if (cornerRadius > 0) {
    node.corners = {
      radii: [cornerRadius, cornerRadius, cornerRadius, cornerRadius],
      smoothing: 0
    };
  }
  if (stroke) {
    node.stroke = {
      align: 'inside',
      weight: stroke.width || 1,
      cap_start: 'none',
      cap_end: 'none',
      dashes: [],
      join: 'miter',
      miter_limit: 4,
      sides: null
    };
    node.strokes = [{
      type: 'solid',
      color: stroke.color || C.border,
      opacity: stroke.color.a ?? 1,
      visible: true,
      blend: 'normal'
    }];
  }
  registerNode(node);
  addChild(parentId, id);
  return id;
}

function createText(parentId, characters, x, y, width, height, fontSize = 14, fontWeight = 'Medium', color = C.textDark, align = 'left') {
  const id = ++nextId;
  const node = {
    id: id,
    parent: parentId,
    name: characters.length > 30 ? characters.slice(0, 30) + '...' : characters,
    type: 'text',
    characters: String(characters),
    transform: [1, 0, 0, 1, x, y],
    width: width,
    height: height,
    fills: [{
      type: 'solid',
      color: color,
      opacity: color.a ?? 1,
      visible: true,
      blend: 'normal'
    }],
    style: {
      font_family: 'Montserrat',
      font_size: fontSize,
      font_style: fontWeight,
      decoration: 'none',
      case: 'original',
      letter_spacing: { unit: 'percent', value: 0 },
      line_height: { unit: 'auto' },
      link: null
    }
  };
  registerNode(node);
  addChild(parentId, id);
  return id;
}

function createBadge(parentId, text, x, y, bg = C.successBg, textColor = C.success) {
  const paddingX = 10;
  const charWidth = 6.8;
  const width = Math.max(54, text.length * charWidth + paddingX * 2);
  const height = 22;
  const frameId = createFrame(parentId, 'Badge: ' + text, x, y, width, height, bg, 11);
  createText(frameId, text, 0, 4, width, 14, 10, 'Semi Bold', textColor);
  return frameId;
}

function createButton(parentId, label, x, y, width, height, bg = C.primaryContainer, textColor = C.white, cornerRadius = 12) {
  const btnFrame = createFrame(parentId, 'Btn: ' + label, x, y, width, height, bg, cornerRadius);
  createText(btnFrame, label, 0, (height - 16) / 2, width, 16, 13, 'Bold', textColor);
  return btnFrame;
}

// ==========================================
// REUSABLE SHELL COMPONENTS
// ==========================================

function renderPublicNavbar(parentId, active = 'Lihat Makanan') {
  const navFrame = createFrame(parentId, 'Header Navbar (Global)', 0, 0, 1440, 64, C.surface);
  createRect(navFrame, 'Nav Border Bottom', 0, 63, 1440, 1, C.border);

  // Logo Icon + Text
  createRect(navFrame, 'Logo Icon Box', 80, 14, 36, 36, C.primaryContainer, 10);
  createText(navFrame, 'SF', 80, 22, 36, 18, 14, 'Bold', C.white);
  createText(navFrame, 'ShareFood', 126, 20, 120, 24, 18, 'Bold', C.primary);

  // Nav Items
  const items = [
    { name: 'Beranda', x: 480, w: 70 },
    { name: 'Lihat Makanan', x: 570, w: 110 },
    { name: 'Panduan Keamanan', x: 700, w: 140 }
  ];

  items.forEach(item => {
    const isActive = item.name === active;
    createText(navFrame, item.name, item.x, 22, item.w, 20, 14, isActive ? 'Bold' : 'Medium', isActive ? C.primary : C.textMuted);
    if (isActive) {
      createRect(navFrame, 'Active Indicator', item.x, 61, item.w, 3, C.primary);
    }
  });

  // Right Actions
  createText(navFrame, 'Masuk', 1060, 23, 60, 20, 13, 'Semi Bold', C.primary);
  createButton(navFrame, 'Daftar', 1130, 14, 80, 36, C.primaryLight, C.primary, 10);
  createButton(navFrame, '+ Bagikan', 1220, 14, 110, 36, C.primaryContainer, C.white, 10);
  createRect(navFrame, 'User Avatar', 1340, 14, 36, 36, C.primaryTint, 18);
  createText(navFrame, 'W', 1340, 22, 36, 18, 13, 'Bold', C.primary);
}

function renderDashboardShell(parentId, title, activeSidebar = 'Dashboard') {
  // Topbar
  const topbar = createFrame(parentId, 'Dashboard Topbar', 0, 0, 1440, 64, C.surface);
  createRect(topbar, 'Border Bottom', 0, 63, 1440, 1, C.border);

  createRect(topbar, 'Logo Box', 24, 14, 36, 36, C.primaryContainer, 10);
  createText(topbar, 'SF', 24, 22, 36, 18, 14, 'Bold', C.white);
  createText(topbar, 'ShareFood Warga', 68, 21, 160, 22, 16, 'Bold', C.primary);

  // Search input on topbar
  createRect(topbar, 'Search Bar', 280, 14, 380, 36, C.background, 10, { color: C.border });
  createText(topbar, '🔍 Cari transaksi, makanan, atau warga...', 296, 23, 340, 18, 12, 'Medium', C.textLight);

  // User profile right
  createText(topbar, '🔔', 1230, 22, 24, 20, 16, 'Medium', C.textMuted);
  createRect(topbar, 'Avatar Box', 1270, 14, 36, 36, C.primaryLight, 18);
  createText(topbar, 'BS', 1270, 23, 36, 18, 12, 'Bold', C.primary);
  createText(topbar, 'Budi Santoso', 1315, 23, 100, 20, 13, 'Semi Bold', C.textDark);

  // Sidebar
  const sidebar = createFrame(parentId, 'Dashboard Sidebar', 0, 64, 240, 836, C.surface);
  createRect(sidebar, 'Border Right', 239, 0, 1, 836, C.border);

  const menu = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Makanan Saya', icon: '🍲' },
    { name: 'Permintaan Masuk', icon: '📬' },
    { name: 'Makanan Diambil', icon: '🛍️' },
    { name: 'Riwayat & Dampak', icon: '📜' },
    { name: 'Profil & Pengaturan', icon: '⚙️' }
  ];

  let my = 20;
  menu.forEach(item => {
    const isActive = item.name === activeSidebar;
    if (isActive) {
      createRect(sidebar, 'Active Item Bg', 12, my, 216, 40, C.primaryTint, 8);
      createRect(sidebar, 'Active Bar', 12, my + 6, 3, 28, C.primary, 2);
    }
    createText(sidebar, item.icon, 24, my + 11, 24, 20, 14, 'Medium', isActive ? C.primary : C.textMuted);
    createText(sidebar, item.name, 56, my + 11, 160, 20, 13, isActive ? 'Bold' : 'Medium', isActive ? C.primary : C.textMuted);
    my += 48;
  });

  // Footer sidebar info
  createRect(sidebar, 'Impact Box Mini', 16, 730, 208, 80, C.primaryTint, 12);
  createText(sidebar, '🌱 Dampak Komunitas', 28, 742, 180, 16, 11, 'Bold', C.primary);
  createText(sidebar, '64.2 kg CO2e dicegah', 28, 762, 180, 18, 13, 'Bold', C.textDark);
  createText(sidebar, 'Bersama 18 Warga RT/RW', 28, 784, 180, 14, 10, 'Medium', C.textMuted);
}

function renderPublicFooter(parentId, y = 1100) {
  const footer = createFrame(parentId, 'Footer (Global)', 0, y, 1440, 200, C.surface);
  createRect(footer, 'Border Top', 0, 0, 1440, 1, C.border);

  // Col 1: Brand
  createText(footer, 'ShareFood Indonesia', 80, 32, 260, 24, 17, 'Bold', C.primary);
  createText(footer, 'Platform gotong royong warga untuk mencegah pemborosan makanan berlebih yang masih layak dikonsumsi secara aman, cepat, dan transparan.', 80, 62, 320, 60, 12, 'Medium', C.textMuted);
  createText(footer, '© 2026 ShareFood. Lisensi Terbuka Komunitas.', 80, 148, 300, 16, 11, 'Medium', C.textLight);

  // Col 2: Navigasi
  createText(footer, 'Navigasi Warga', 460, 32, 160, 20, 13, 'Bold', C.textDark);
  createText(footer, '• Beranda Publik', 460, 60, 160, 18, 12, 'Medium', C.textMuted);
  createText(footer, '• Jelajah Katalog Makanan', 460, 84, 160, 18, 12, 'Medium', C.textMuted);
  createText(footer, '• Panduan Keamanan Pangan', 460, 108, 160, 18, 12, 'Medium', C.textMuted);
  createText(footer, '• Masuk & Registrasi Warga', 460, 132, 160, 18, 12, 'Medium', C.textMuted);

  // Col 3: Standar & Etika
  createText(footer, 'Standar & Etika', 740, 32, 180, 20, 13, 'Bold', C.textDark);
  createText(footer, '• Pengecekan Kualitas 4 Titik', 740, 60, 180, 18, 12, 'Medium', C.textMuted);
  createText(footer, '• Etika Pengambilan Warga', 740, 84, 180, 18, 12, 'Medium', C.textMuted);
  createText(footer, '• Kebijakan Privasi Alamat', 740, 108, 180, 18, 12, 'Medium', C.textMuted);
  createText(footer, '• Laporan Makanan Tidak Layak', 740, 132, 180, 18, 12, 'Medium', C.textMuted);

  // Col 4: Narahubung
  createText(footer, 'Bantuan Komunitas', 1020, 32, 200, 20, 13, 'Bold', C.textDark);
  createText(footer, 'Ada kendala atau ingin mendaftarkan komunitas RT/RW Anda?', 1020, 60, 280, 36, 12, 'Medium', C.textMuted);
  createButton(footer, 'Hubungi WhatsApp Relawan', 1020, 104, 220, 36, C.primaryLight, C.primary, 10);
}

// 12 Real Food Items with rich palettes & icons
const foodItemsCatalog = [
  { title: 'Roti Sourdough & Croissant', cat: 'Roti dan Kue', portion: '6 porsi', loc: 'Tebet Barat', exp: 'Hari ini 21:00', bg: C.bakeryBg, icon: '🥐', st: 'AVAILABLE' },
  { title: 'Nasi Kotak Ayam Bakar Madu', cat: 'Makanan Berat', portion: '8 porsi', loc: 'Tebet Timur', exp: 'Hari ini 20:00', bg: C.bentoBg, icon: '🍱', st: 'AVAILABLE' },
  { title: 'Sayur Hidroponik Campur Segar', cat: 'Buah dan Sayur', portion: '4 ikat', loc: 'Manggarai Selatan', exp: 'Besok 10:00', bg: C.veggieBg, icon: '🥬', st: 'AVAILABLE' },
  { title: 'Jus Buah Cold-Pressed Harian', cat: 'Minuman', portion: '5 botol', loc: 'Kuningan Timur', exp: 'Hari ini 22:00', bg: C.juiceBg, icon: '🧃', st: 'AVAILABLE' },
  { title: 'Pisang Cavendish & Alpukat Mentega', cat: 'Buah dan Sayur', portion: '3 paket', loc: 'Pancoran', exp: 'Besok 12:00', bg: C.fruitBg, icon: '🍌', st: 'AVAILABLE' },
  { title: 'Beras Merah Organik & Kacang', cat: 'Bahan Mentah', portion: '2 kantong', loc: 'Kalibata', exp: '3 hari lagi', bg: C.grainBg, icon: '🌾', st: 'AVAILABLE' },
  { title: 'Aneka Jajanan Pasar Tradisional', cat: 'Roti dan Kue', portion: '12 potong', loc: 'Mampang Prapatan', exp: 'Hari ini 19:30', bg: C.bakeryBg, icon: '🥟', st: 'AVAILABLE' },
  { title: 'Penne Pasta Aglio Olio Sayur', cat: 'Makanan Berat', portion: '4 kotak', loc: 'Cikoko', exp: 'Hari ini 21:30', bg: C.bentoBg, icon: '🍝', st: 'AVAILABLE' },
  { title: 'Susu Gandum (Oat Milk) Barista', cat: 'Minuman', portion: '3 liter', loc: 'Duren Tiga', exp: 'Besok 18:00', bg: C.drinkBg, icon: '🥛', st: 'AVAILABLE' },
  { title: 'Tahu Sutra & Tempe Daun Segar', cat: 'Bahan Mentah', portion: '6 bungkus', loc: 'Bukit Duri', exp: 'Besok 09:00', bg: C.veggieBg, icon: '🥗', st: 'AVAILABLE' },
  { title: 'Muffin Blueberry & Cokelat Vegan', cat: 'Roti dan Kue', portion: '8 buah', loc: 'Pejaten Barat', exp: 'Besok 15:00', bg: C.bakeryBg, icon: '🧁', st: 'AVAILABLE' },
  { title: 'Sup Krim Jagung Manis & Buncis', cat: 'Makanan Berat', portion: '5 porsi', loc: 'Kebayoran Baru', exp: 'Hari ini 21:00', bg: C.soupBg, icon: '🍲', st: 'AVAILABLE' }
];

function renderFoodCard(parentId, x, y, width, height, item) {
  const card = createFrame(parentId, 'Card: ' + item.title, x, y, width, height, C.surface, 18);
  createRect(card, 'Card Border', 0, 0, width, height, null, 18, { color: C.border });

  // Rich Thematic Image Container with Icon
  const imgH = 135;
  createRect(card, 'Img Container', 0, 0, width, imgH, item.bg || C.primaryTint, 0);
  createText(card, item.icon || '🍲', (width - 48) / 2, 44, 48, 48, 36, 'Bold', C.primary);

  // Status Badge top-left
  createBadge(card, item.st || 'AVAILABLE', 12, 12, C.successBg, C.success);

  // Category Tag bottom-right
  createBadge(card, item.cat, width - 105, imgH - 28, { r: 10/255, g: 38/255, b: 23/255, a: 0.8 }, C.white);

  // Content
  const cy = imgH + 12;
  createText(card, item.title, 14, cy, width - 28, 20, 13, 'Bold', C.textDark);
  createText(card, '📦 Jumlah: ' + item.portion, 14, cy + 22, width - 28, 16, 12, 'Bold', C.primary);
  createText(card, '📍 Area: ' + item.loc, 14, cy + 40, width - 28, 16, 11, 'Medium', C.textMuted);
  createText(card, '⏰ Batas: ' + item.exp, 14, cy + 58, width - 28, 16, 11, 'Semi Bold', C.warning);

  // Action Button
  createButton(card, 'Ambil  →', 14, height - 44, width - 28, 34, C.primaryContainer, C.white, 10);
}

// ==========================================
// 17 HIGH-FIDELITY SCREEN IMPLEMENTATIONS
// ==========================================

// 1. s1_beranda
function buildScreen1(parentId, x, y) {
  const frame = createFrame(parentId, '01 - Beranda Publik (s1)', x, y, 1440, 1000, C.background);
  renderPublicNavbar(frame, 'Beranda');

  // Hero Section
  createBadge(frame, '🌱 KOMUNITAS PEDULI PANGAN INDONESIA', 80, 88, C.primaryLight, C.primary);
  createText(frame, 'Berbagi Makanan,\nCegah Pemborosan.', 80, 120, 680, 84, 36, 'Bold', C.textDark);
  createText(frame, 'Hubungkan warga sekitar untuk menyelamatkan surplus makanan berlebih yang masih sangat layak konsumsi secara gratis, aman, dan beretika gotong royong.', 80, 218, 620, 48, 14, 'Medium', C.textMuted);

  createButton(frame, 'Lihat Makanan Tersedia  →', 80, 280, 220, 44, C.primaryContainer, C.white, 12);
  createButton(frame, 'Mulai Bagikan Makanan', 314, 280, 200, 44, C.primaryLight, C.primary, 12);

  // Hero Right Illustration Card
  createRect(frame, 'Hero Banner Frame', 760, 88, 600, 240, C.primaryTint, 20, { color: C.border });
  createBadge(frame, '⚡ STATISTIK DAMPAK LANGSUNG', 790, 110, C.white, C.primary);
  createText(frame, '1.240+ Porsi', 790, 144, 240, 36, 26, 'Bold', C.primary);
  createText(frame, 'Makanan berhasil diselamatkan dari tempat sampah', 790, 184, 240, 36, 11, 'Medium', C.textMuted);

  createText(frame, '64.2 kg CO2e', 1060, 144, 240, 36, 26, 'Bold', C.primaryContainer);
  createText(frame, 'Emisi gas rumah kaca berhasil dicegah bersama', 1060, 184, 240, 36, 11, 'Medium', C.textMuted);

  // 3 Value Prop Cards
  const vps = [
    { title: '1. Kualitas Terjamin', desc: 'Makanan diverifikasi dengan 4 pilar keamanan pangan sebelum diserahkan.' },
    { title: '2. Privasi Aman', desc: 'Alamat lengkap donatur hanya dibagikan setelah permintaan resmi disetujui.' },
    { title: '3. Transparan & Adil', desc: 'Sistem kuota porsi merata untuk menghindari penimbunan oleh oknum.' }
  ];
  let vx = 80;
  vps.forEach(v => {
    const card = createFrame(frame, 'VP Card: ' + v.title, vx, 350, 390, 100, C.surface, 16);
    createRect(card, 'Border', 0, 0, 390, 100, null, 16, { color: C.border });
    createText(card, v.title, 18, 16, 350, 20, 13, 'Bold', C.primary);
    createText(card, v.desc, 18, 40, 350, 44, 11, 'Medium', C.textMuted);
    vx += 425;
  });

  // Section 2: Makanan Baru Ditambahkan
  createText(frame, 'Makanan Baru Ditambahkan di Sekitar Anda', 80, 474, 600, 26, 18, 'Bold', C.textDark);
  createText(frame, 'Menampilkan makanan surplus dari warga yang siap diambil hari ini.', 80, 502, 600, 20, 12, 'Medium', C.textMuted);

  for (let i = 0; i < 4; i++) {
    renderFoodCard(frame, 80 + i * 325, 532, 300, 280, foodItemsCatalog[i]);
  }

  renderPublicFooter(frame, 830);
}

// 2. s2_daftar_makanan
function buildScreen2(parentId, x, y) {
  const frame = createFrame(parentId, '02 - Daftar Makanan Tersedia (s2)', x, y, 1440, 1000, C.background);
  renderPublicNavbar(frame, 'Lihat Makanan');

  // Header Title
  createBadge(frame, '🌱 AKSI NYATA CEGAH PEMBOROSAN PANGAN', 80, 80, C.primaryLight, C.primary);
  createText(frame, 'Makanan Tersedia', 80, 106, 600, 32, 26, 'Bold', C.textDark);
  createText(frame, 'Temukan makanan layak konsumsi gratis yang dibagikan oleh warga sekitar.', 80, 140, 700, 20, 13, 'Medium', C.textMuted);

  // Search & Filter Box
  const filterBox = createFrame(frame, 'Search & Filter Box', 80, 170, 1280, 104, C.surface, 18);
  createRect(filterBox, 'Box Border', 0, 0, 1280, 104, null, 18, { color: C.border });

  // Search input
  createRect(filterBox, 'Input Box', 20, 14, 940, 38, C.background, 10, { color: C.border });
  createText(filterBox, '🔍 Cari berdasarkan nama makanan, kategori, atau kelurahan...', 36, 24, 600, 20, 12, 'Medium', C.textLight);

  // Sort dropdown
  createRect(filterBox, 'Sort Dropdown', 980, 14, 280, 38, C.background, 10, { color: C.border });
  createText(filterBox, 'Urutkan: Terbaru Ditambahkan  ▼', 996, 24, 240, 20, 12, 'Semi Bold', C.textDark);

  // Chips
  const chips = ['Semua', 'Makanan Berat', 'Roti dan Kue', 'Buah dan Sayur', 'Bahan Mentah', 'Minuman', 'Lainnya'];
  let cx = 20;
  chips.forEach((c, idx) => {
    const isFirst = idx === 0;
    const chipW = c.length * 8 + 24;
    createFrame(filterBox, 'Chip: ' + c, cx, 62, chipW, 28, isFirst ? C.primaryContainer : C.background, 14);
    createText(filterBox, c, cx, 68, chipW, 16, 11, isFirst ? 'Bold' : 'Medium', isFirst ? C.white : C.textMuted);
    cx += chipW + 10;
  });

  // Counter Metric Bar
  createText(frame, 'Menampilkan 12 makanan tersedia', 80, 286, 400, 20, 13, 'Bold', C.textDark);
  createBadge(frame, '🟢 Pembaruan Langsung', 1190, 284, C.successBg, C.success);

  // 8 Food Cards Grid (4 cols x 2 rows fit cleanly on 1000px height!)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      renderFoodCard(frame, 80 + c * 325, 316 + r * 296, 300, 280, foodItemsCatalog[idx]);
    }
  }

  renderPublicFooter(frame, 920);
}

// 3. s3_detail_makanan (Modal Over s2)
function buildScreen3(parentId, x, y) {
  const frame = createFrame(parentId, '03 - Detail Makanan Modal (s3)', x, y, 1440, 900, C.background);
  // Render real catalog underneath so user sees full context!
  renderPublicNavbar(frame, 'Lihat Makanan');
  for (let c = 0; c < 4; c++) {
    renderFoodCard(frame, 80 + c * 325, 120, 300, 280, foodItemsCatalog[c]);
    renderFoodCard(frame, 80 + c * 325, 420, 300, 280, foodItemsCatalog[c + 4]);
  }

  // Gentle Scrim Overlay (45% opacity)
  createRect(frame, 'Modal Scrim Backdrop', 0, 0, 1440, 900, C.scrim);

  // Centered Modal Dialog (640x760)
  const modal = createFrame(frame, 'Detail Modal Container', 400, 50, 640, 780, C.surface, 24);
  createRect(modal, 'Modal Border', 0, 0, 640, 780, null, 24, { color: C.border });

  // Banner image with thematic warm bakery background & croissant icon
  createRect(modal, 'Food Image Banner', 0, 0, 640, 220, C.bakeryBg, 0);
  createText(modal, '🥐', 290, 80, 60, 60, 48, 'Bold', C.primary);
  createBadge(modal, 'AVAILABLE', 24, 20, C.successBg, C.success);
  createBadge(modal, 'Roti dan Kue', 520, 20, { r: 10/255, g: 38/255, b: 23/255, a: 0.75 }, C.white);
  createText(modal, '✕', 600, 18, 24, 24, 18, 'Bold', C.white);

  // Modal Content
  createText(modal, 'Roti Sourdough & Croissant Segar', 24, 238, 590, 28, 20, 'Bold', C.textDark);
  createText(modal, 'Dibagikan oleh Budi Santoso • Warga Terverifikasi Tebet Barat', 24, 268, 590, 20, 12, 'Medium', C.textMuted);

  // 3 Specs Strip
  createRect(modal, 'Spec Strip', 24, 298, 592, 60, C.background, 12, { color: C.borderLight });
  createText(modal, '📦 Sisa Porsi', 44, 308, 160, 16, 11, 'Medium', C.textMuted);
  createText(modal, '6 Porsi', 44, 326, 160, 20, 14, 'Bold', C.textDark);

  createText(modal, '📍 Estimasi Area', 240, 308, 160, 16, 11, 'Medium', C.textMuted);
  createText(modal, 'Tebet Barat (Radius 500m)', 240, 326, 180, 20, 13, 'Bold', C.textDark);

  createText(modal, '⏰ Batas Ambil', 440, 308, 160, 16, 11, 'Medium', C.textMuted);
  createText(modal, 'Hari ini, 21:00 WIB', 440, 326, 160, 20, 13, 'Bold', C.warning);

  // Description
  createText(modal, 'Deskripsi Makanan & Catatan Donatur:', 24, 376, 590, 20, 13, 'Bold', C.textDark);
  createText(modal, 'Sisa stok display bakery artisan sore ini. Kondisi masih sangat renyah, fresh, dan higienis dalam bungkusan kertas food-grade individual. Cocok untuk sarapan atau camilan keluarga.', 24, 400, 592, 48, 12, 'Medium', C.textMuted);

  // Safety Checklist
  createRect(modal, 'Safety Box', 24, 460, 592, 110, C.primaryTint, 12, { color: C.borderLight });
  createText(modal, '✅ Checklist Verifikasi Kelayakan Pangan ShareFood:', 40, 472, 540, 20, 12, 'Bold', C.primary);
  createText(modal, '• Kemasan tersegel dan tertutup rapat sejak dibuat.', 40, 494, 540, 18, 11, 'Medium', C.textDark);
  createText(modal, '• Disimpan pada suhu ruangan yang kering dan bersih.', 40, 514, 540, 18, 11, 'Medium', C.textDark);
  createText(modal, '• Tidak mengandung pengawet buatan berbahaya.', 40, 534, 540, 18, 11, 'Medium', C.textDark);

  // Bottom action
  createButton(modal, 'Ajukan Pengambilan Makanan Ini  →', 24, 700, 592, 48, C.primaryContainer, C.white, 14);
}

// 4. s4_modal_ambil
function buildScreen4(parentId, x, y) {
  const frame = createFrame(parentId, '04 - Modal Ambil Makanan Dialog (s4)', x, y, 1440, 900, C.background);
  renderPublicNavbar(frame, 'Lihat Makanan');
  for (let c = 0; c < 4; c++) {
    renderFoodCard(frame, 80 + c * 325, 120, 300, 280, foodItemsCatalog[c]);
    renderFoodCard(frame, 80 + c * 325, 420, 300, 280, foodItemsCatalog[c + 4]);
  }
  createRect(frame, 'Modal Scrim Backdrop', 0, 0, 1440, 900, C.scrim);

  const modal = createFrame(frame, 'Claim Dialog Container', 460, 90, 520, 680, C.surface, 24);
  createRect(modal, 'Modal Border', 0, 0, 520, 680, null, 24, { color: C.border });

  // Title & Close
  createText(modal, 'Ajukan Pengambilan Makanan', 28, 28, 400, 24, 18, 'Bold', C.textDark);
  createText(modal, '✕', 470, 28, 24, 24, 16, 'Bold', C.textMuted);

  // Summary snippet box
  createRect(modal, 'Food Mini Card', 28, 68, 464, 64, C.background, 12, { color: C.borderLight });
  createRect(modal, 'Food Thumb', 40, 78, 44, 44, C.bakeryBg, 8);
  createText(modal, '🥐', 50, 88, 24, 24, 18, 'Bold', C.primary);
  createText(modal, 'Roti Sourdough & Croissant', 96, 78, 300, 20, 13, 'Bold', C.textDark);
  createText(modal, 'Tersedia: 6 porsi • Tebet Barat', 96, 98, 300, 18, 11, 'Medium', C.textMuted);

  // Form Fields
  createText(modal, 'Jumlah Porsi yang Ingin Diambil', 28, 150, 464, 18, 12, 'Bold', C.textDark);
  createRect(modal, 'Counter Box', 28, 172, 160, 40, C.background, 10, { color: C.border });
  createText(modal, '−', 44, 182, 24, 20, 16, 'Bold', C.textMuted);
  createText(modal, '2 Porsi', 82, 183, 60, 20, 13, 'Bold', C.textDark);
  createText(modal, '+', 156, 182, 24, 20, 16, 'Bold', C.primary);

  createText(modal, 'Prakiraan Jam Pengambilan', 28, 230, 464, 18, 12, 'Bold', C.textDark);
  const slots = ['16:00 - 17:00 WIB', '17:00 - 18:30 WIB', '18:30 - 20:00 WIB'];
  slots.forEach((s, idx) => {
    const isSel = idx === 1;
    createRect(modal, 'Radio Slot ' + idx, 28, 252 + idx * 42, 464, 34, isSel ? C.primaryTint : C.background, 8, { color: isSel ? C.primary : C.border });
    createText(modal, (isSel ? '🟢 ' : '⚪ ') + s, 42, 260 + idx * 42, 400, 18, 12, isSel ? 'Bold' : 'Medium', isSel ? C.primary : C.textDark);
  });

  createText(modal, 'Catatan Singkat untuk Donatur (Opsional)', 28, 390, 464, 18, 12, 'Bold', C.textDark);
  createRect(modal, 'Textarea Box', 28, 412, 464, 70, C.background, 10, { color: C.border });
  createText(modal, 'Contoh: Saya akan membawa tas belanja kain sendiri dari rumah...', 40, 424, 440, 20, 12, 'Medium', C.textLight);

  // Checkbox commitment
  createRect(modal, 'Check Box', 28, 498, 20, 20, C.primaryLight, 6, { color: C.primary });
  createText(modal, '✓', 32, 500, 16, 16, 12, 'Bold', C.primary);
  createText(modal, 'Saya berkomitmen untuk hadir tepat waktu dan mematuhi etika warga gotong royong ShareFood.', 56, 498, 436, 36, 11, 'Medium', C.textDark);

  // Actions
  createButton(modal, 'Kirim Permintaan Pengambilan  →', 28, 600, 464, 46, C.primaryContainer, C.white, 12);
}

// 5. s5_panduan_keamanan (Exact Match with HTML!)
function buildScreen5(parentId, x, y) {
  const frame = createFrame(parentId, '05 - Panduan Keamanan Pangan (s5)', x, y, 1440, 950, C.background);
  renderPublicNavbar(frame, 'Panduan Keamanan');

  // Title Section
  createBadge(frame, '🛡️ KOMUNITAS & KESELAMATAN', 80, 80, C.primaryLight, C.primary);
  createText(frame, 'Panduan Keamanan & Komunitas', 80, 106, 700, 32, 26, 'Bold', C.textDark);
  createText(frame, 'Pedoman wajib untuk menjaga kebersihan makanan, keamanan diri, dan privasi sesama warga saat berbagi makanan secara mandiri.', 80, 140, 800, 20, 13, 'Medium', C.textMuted);

  // 2x2 Safety Grid (4 Cards)
  const pillars = [
    { title: '1. Bertemu di Tempat Terang & Ramah', desc: 'Sepakati titik temu di area publik atau lokasi yang terang dan mudah dijangkau saat mengambil makanan di luar jam kerja.', tip: '📍 Disarankan pos satpam, lobi, atau minimarket', icon: '🛡️', bg: C.primaryTint },
    { title: '2. Periksa Kondisi Makanan Saat Pengambilan', desc: 'Cek aroma, tekstur, dan suhu makanan sebelum dikonsumsi. Jangan konsumsi jika kemasan rusak atau berbau tidak sedap.', tip: '🧼 Selalu gunakan wadah tertutup yang higienis', icon: '✅', bg: C.primaryTint },
    { title: '3. Baca Informasi Alergen dengan Teliti', desc: 'Selalu tanyakan dan verifikasi kandungan bahan makanan (kacang, susu, gluten, seafood) bila memiliki riwayat alergi tertentu.', tip: '⚠️ Konfirmasi silang bila ragu dengan bahan makanan', icon: '⚠️', bg: C.dangerBg, alert: true },
    { title: '4. Jaga Privasi Data Pribadi', desc: 'Alamat lengkap dan kontak pemberi hanya dibuka untuk peminta yang disetujui. Dilarang menyebarluaskan kontak warga.', tip: '🔒 Data terenkripsi dan dijaga ketat di platform', icon: '🔒', bg: C.primaryTint }
  ];

  pillars.forEach((p, idx) => {
    const px = 80 + (idx % 2) * 650;
    const py = 175 + Math.floor(idx / 2) * 160;
    const card = createFrame(frame, 'Safety Card ' + idx, px, py, 630, 146, C.surface, 18);
    createRect(card, 'Border', 0, 0, 630, 146, null, 18, { color: C.border });

    // Icon box 48x48
    createRect(card, 'Icon Box', 20, 20, 44, 44, p.bg, 12);
    createText(card, p.icon, 20, 28, 44, 24, 20, 'Bold', C.primary);

    createText(card, p.title, 76, 20, 530, 22, 14, 'Bold', C.textDark);
    createText(card, p.desc, 76, 44, 530, 44, 11, 'Medium', C.textMuted);
    createText(card, p.tip, 76, 104, 530, 20, 11, 'Semi Bold', p.alert ? C.danger : C.primary);
  });

  // Manual Reporting Info Box
  const repBox = createFrame(frame, 'Reporting Box', 80, 520, 1280, 100, C.surface, 16);
  createRect(repBox, 'Border', 0, 0, 1280, 100, null, 16, { color: C.border });
  createRect(repBox, 'Green Accent Left', 0, 0, 6, 100, C.primaryContainer, 0);

  createRect(repBox, 'Icon Circle', 24, 26, 48, 48, C.primaryLight, 24);
  createText(repBox, '💬', 24, 38, 48, 24, 20, 'Bold', C.primary);

  createText(repBox, 'Cara Melapor Postingan Bermasalah', 88, 22, 600, 22, 15, 'Bold', C.textDark);
  createText(repBox, 'Menemukan postingan yang tidak higienis atau melanggar ketentuan komunitas? Laporkan langsung ke pengelola via email pengelola@sharefood.id atau WhatsApp hotline relawan.', 88, 48, 780, 36, 12, 'Medium', C.textMuted);

  createButton(repBox, 'Hubungi Kontak Pengelola  ✉️', 980, 28, 260, 44, C.textDark, C.white, 12);

  // Bottom Action Banner
  const actBanner = createFrame(frame, 'Action Banner', 80, 640, 1280, 120, C.primaryTint, 16);
  createRect(actBanner, 'Border', 0, 0, 1280, 120, null, 16, { color: C.borderLight });
  createText(actBanner, '🍽️', 620, 16, 40, 40, 28, 'Bold', C.primary);
  createText(actBanner, 'Siap Berbagi dan Menyelamatkan Makanan?', 340, 52, 600, 24, 16, 'Bold', C.textDark);
  createText(actBanner, 'Jelajahi sajian lezat berlebih yang siap diambil di sekitarmu dengan aman dan bermartabat.', 340, 76, 600, 20, 12, 'Medium', C.textMuted);
  createButton(actBanner, 'Lihat Makanan Tersedia  🔍', 960, 38, 240, 44, C.primaryContainer, C.white, 12);

  renderPublicFooter(frame, 780);
}

// 6. s6_login (Rich Split Screen!)
function buildScreen6(parentId, x, y) {
  const frame = createFrame(parentId, '06 - Portal Login Warga (s6)', x, y, 1440, 900, C.surface);
  renderPublicNavbar(frame, 'Beranda');

  // Left Hero Banner (560px)
  const leftBanner = createFrame(frame, 'Left Brand Banner', 0, 64, 560, 836, C.primary);
  createText(leftBanner, '🌱', 60, 80, 60, 60, 40, 'Bold', C.white);
  createText(leftBanner, 'Selamat Datang\nKembali di ShareFood', 60, 150, 440, 80, 30, 'Bold', C.white);
  createText(leftBanner, 'Lanjutkan aksi nyata gotong royong mencegah pemborosan makanan berlebih dan bangun ketahanan pangan warga.', 60, 240, 440, 60, 14, 'Medium', C.primaryLight);

  // Testimonial Card
  const tCard = createFrame(leftBanner, 'Quote Card', 60, 340, 440, 140, { r: 1, g: 1, b: 1, a: 0.12 }, 16);
  createText(leftBanner, '"Berbagi surplus makanan di sekitar rumah kini jadi sangat mudah, aman, dan menjaga martabat sesama tetangga."', 84, 360, 390, 50, 12, 'Medium', C.white);
  createText(leftBanner, '— Budi Santoso, Donatur Warga Tebet', 84, 420, 390, 20, 12, 'Bold', C.primaryLight);

  // Right Form Container (880px)
  const rightArea = createFrame(frame, 'Right Form Area', 560, 64, 880, 836, C.background);
  const card = createFrame(rightArea, 'Login Card', 220, 140, 440, 480, C.surface, 20);
  createRect(card, 'Card Border', 0, 0, 440, 480, null, 20, { color: C.border });

  createRect(card, 'Logo Box', 202, 30, 36, 36, C.primaryContainer, 10);
  createText(card, 'SF', 202, 38, 36, 18, 14, 'Bold', C.white);

  createText(card, 'Masuk ke Akun Anda', 40, 80, 360, 26, 20, 'Bold', C.textDark);
  createText(card, 'Gunakan email dan kata sandi warga terdaftar', 40, 108, 360, 20, 12, 'Medium', C.textMuted);

  // Email Field
  createText(card, 'Alamat Email', 40, 144, 360, 18, 12, 'Bold', C.textDark);
  createRect(card, 'Email Input', 40, 166, 360, 40, C.background, 10, { color: C.border });
  createText(card, 'warga@komunitas.id', 54, 177, 330, 20, 13, 'Medium', C.textDark);

  // Password Field
  createText(card, 'Kata Sandi', 40, 218, 360, 18, 12, 'Bold', C.textDark);
  createRect(card, 'Password Input', 40, 240, 360, 40, C.background, 10, { color: C.border });
  createText(card, '••••••••••••', 54, 252, 280, 20, 14, 'Bold', C.textDark);
  createText(card, '👁️', 368, 250, 24, 20, 13, 'Medium', C.textMuted);

  // Remember & Forgot
  createText(card, '☑ Ingat saya', 40, 294, 160, 18, 12, 'Medium', C.textMuted);
  createText(card, 'Lupa kata sandi?', 280, 294, 120, 18, 12, 'Semi Bold', C.primary);

  // Submit button
  createButton(card, 'Masuk ke Akun Warga  →', 40, 334, 360, 46, C.primaryContainer, C.white, 12);

  // Bottom register link
  createText(card, 'Belum memiliki akun?', 100, 410, 150, 20, 12, 'Medium', C.textMuted);
  createText(card, 'Daftar Sekarang', 246, 410, 120, 20, 12, 'Bold', C.primary);
}

// 7. s7_register (Rich Split Screen!)
function buildScreen7(parentId, x, y) {
  const frame = createFrame(parentId, '07 - Portal Register Warga (s7)', x, y, 1440, 900, C.surface);
  renderPublicNavbar(frame, 'Beranda');

  // Left Hero Banner (560px)
  const leftBanner = createFrame(frame, 'Left Brand Banner', 0, 64, 560, 836, C.primary);
  createText(leftBanner, '🤝', 60, 80, 60, 60, 40, 'Bold', C.white);
  createText(leftBanner, 'Daftar Akun Baru\nKomunitas ShareFood', 60, 150, 440, 80, 30, 'Bold', C.white);
  createText(leftBanner, 'Bergabung bersama ribuan warga yang peduli surplus pangan dan kelestarian lingkungan sekitar.', 60, 240, 440, 60, 14, 'Medium', C.primaryLight);

  const tCard = createFrame(leftBanner, 'Perk Card', 60, 330, 440, 150, { r: 1, g: 1, b: 1, a: 0.12 }, 16);
  createText(leftBanner, '✓ Ambil makanan lezat & berkualitas gratis di sekitar', 84, 350, 390, 24, 12, 'Bold', C.white);
  createText(leftBanner, '✓ Bagikan surplus makanan dalam hitungan detik', 84, 382, 390, 24, 12, 'Bold', C.white);
  createText(leftBanner, '✓ Pantau dampak pengurangan emisi karbon Anda', 84, 414, 390, 24, 12, 'Bold', C.white);

  // Right Form Container (880px)
  const rightArea = createFrame(frame, 'Right Form Area', 560, 64, 880, 836, C.background);
  const card = createFrame(rightArea, 'Register Card', 200, 60, 480, 710, C.surface, 20);
  createRect(card, 'Card Border', 0, 0, 480, 710, null, 20, { color: C.border });

  createRect(card, 'Logo Box', 222, 24, 36, 36, C.primaryContainer, 10);
  createText(card, 'SF', 222, 32, 36, 18, 14, 'Bold', C.white);

  createText(card, 'Daftar Akun Warga', 40, 70, 400, 24, 19, 'Bold', C.textDark);
  createText(card, 'Lengkapi formulir singkat untuk mulai berinteraksi', 40, 96, 400, 18, 12, 'Medium', C.textMuted);

  const fields = [
    { label: 'Nama Lengkap Sesuai KTP', val: 'Budi Santoso' },
    { label: 'Nomor WhatsApp Aktif', val: '0812-3456-7890' },
    { label: 'Alamat Email', val: 'budi@warga.id' },
    { label: 'Kata Sandi', val: '••••••••••••' },
    { label: 'Kelurahan / Domisili', val: 'Tebet Barat, Jakarta Selatan' }
  ];

  let fy = 126;
  fields.forEach(f => {
    createText(card, f.label, 40, fy, 400, 16, 11, 'Bold', C.textDark);
    createRect(card, 'Input ' + f.label, 40, fy + 18, 400, 36, C.background, 10, { color: C.border });
    createText(card, f.val, 52, fy + 26, 370, 18, 12, 'Medium', C.textDark);
    fy += 64;
  });

  // Terms
  createText(card, '☑ Saya menyetujui Ketentuan Layanan & Etika Warga ShareFood.', 40, fy + 8, 400, 20, 11, 'Medium', C.textMuted);

  createButton(card, 'Daftar Akun Baru  →', 40, fy + 40, 400, 44, C.primaryContainer, C.white, 12);

  createText(card, 'Sudah punya akun?', 140, fy + 100, 120, 20, 12, 'Medium', C.textMuted);
  createText(card, 'Masuk di Sini', 260, fy + 100, 100, 20, 12, 'Bold', C.primary);
}

// 8. s11_dashboard_ringkasan
function buildScreen8(parentId, x, y) {
  const frame = createFrame(parentId, '08 - Dashboard Ringkasan (s11)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Dashboard Warga', 'Dashboard');

  const cx = 270;
  // Welcome banner
  const banner = createFrame(frame, 'Welcome Banner', cx, 88, 1130, 96, C.surface, 16);
  createRect(banner, 'Border', 0, 0, 1130, 96, null, 16, { color: C.border });
  createText(banner, 'Selamat Datang, Budi Santoso! 👋', 24, 20, 600, 26, 20, 'Bold', C.textDark);
  createText(banner, 'Anda aktif di wilayah RT 04 / RW 02, Tebet Barat. Ada 4 permintaan masuk yang butuh respon.', 24, 50, 700, 20, 13, 'Medium', C.textMuted);
  createButton(banner, '+ Bagikan Makanan Baru', 910, 26, 196, 44, C.primaryContainer, C.white, 12);

  // 4 KPI Cards
  const kpis = [
    { label: 'Makanan Aktif Saya', val: '3 Makanan', sub: 'Tersedia untuk diambil', icon: '🍲', color: C.primary },
    { label: 'Permintaan Masuk', val: '4 Menunggu', sub: 'Perlu konfirmasi Anda', icon: '📬', color: C.warning },
    { label: 'Makanan Diterima', val: '12 Paket', sub: 'Total diselamatkan', icon: '🛍️', color: C.primaryContainer },
    { label: 'Total Emisi Dicegah', val: '64.2 kg', sub: 'Setara 18 pohon', icon: '🌱', color: C.success }
  ];

  kpis.forEach((k, idx) => {
    const kx = cx + idx * 290;
    const card = createFrame(frame, 'KPI ' + idx, kx, 204, 270, 108, C.surface, 16);
    createRect(card, 'Border', 0, 0, 270, 108, null, 16, { color: C.border });
    createText(card, k.icon + ' ' + k.label, 16, 16, 230, 18, 11, 'Bold', C.textMuted);
    createText(card, k.val, 16, 38, 230, 30, 22, 'Bold', k.color);
    createText(card, k.sub, 16, 74, 230, 18, 11, 'Medium', C.textMuted);
  });

  // Table 1: Permintaan Masuk Warga
  const t1 = createFrame(frame, 'Table Permintaan', cx, 332, 1130, 236, C.surface, 16);
  createRect(t1, 'Border', 0, 0, 1130, 236, null, 16, { color: C.border });
  createText(t1, 'Permintaan Masuk Perlu Respon', 24, 18, 400, 22, 15, 'Bold', C.textDark);

  createRect(t1, 'THead', 24, 48, 1082, 32, C.background, 6);
  createText(t1, 'PEMOHON', 36, 56, 200, 16, 11, 'Bold', C.textMuted);
  createText(t1, 'MAKANAN', 280, 56, 260, 16, 11, 'Bold', C.textMuted);
  createText(t1, 'PORSI', 580, 56, 100, 16, 11, 'Bold', C.textMuted);
  createText(t1, 'WAKTU JEMPUT', 720, 56, 160, 16, 11, 'Bold', C.textMuted);
  createText(t1, 'AKSI', 940, 56, 120, 16, 11, 'Bold', C.textMuted);

  const reqRows = [
    { user: 'Siti Rahma', food: 'Roti Sourdough & Croissant', p: '2 porsi', time: 'Hari ini 17:00' },
    { user: 'Ahmad Fauzi', food: 'Roti Sourdough & Croissant', p: '1 porsi', time: 'Hari ini 18:30' }
  ];
  reqRows.forEach((r, idx) => {
    const ry = 86 + idx * 64;
    createText(t1, r.user, 36, ry + 12, 200, 18, 13, 'Bold', C.textDark);
    createText(t1, r.food, 280, ry + 12, 260, 18, 12, 'Medium', C.textDark);
    createText(t1, r.p, 580, ry + 12, 100, 18, 12, 'Bold', C.primary);
    createText(t1, r.time, 720, ry + 12, 160, 18, 12, 'Medium', C.textMuted);
    createButton(t1, 'Setujui', 920, ry + 4, 76, 32, C.primaryContainer, C.white, 8);
    createButton(t1, 'Tolak', 1006, ry + 4, 64, 32, C.dangerBg, C.danger, 8);
  });

  // Table 2: Makanan Aktif Saya
  const t2 = createFrame(frame, 'Table Makanan Aktif', cx, 588, 1130, 260, C.surface, 16);
  createRect(t2, 'Border', 0, 0, 1130, 260, null, 16, { color: C.border });
  createText(t2, 'Makanan yang Sedang Saya Bagikan', 24, 18, 400, 22, 15, 'Bold', C.textDark);

  createRect(t2, 'THead 2', 24, 48, 1082, 32, C.background, 6);
  createText(t2, 'NAMA MAKANAN', 36, 56, 280, 16, 11, 'Bold', C.textMuted);
  createText(t2, 'KATEGORI', 340, 56, 160, 16, 11, 'Bold', C.textMuted);
  createText(t2, 'SISA PORSI', 540, 56, 120, 16, 11, 'Bold', C.textMuted);
  createText(t2, 'BATAS KONSUMSI', 720, 56, 180, 16, 11, 'Bold', C.textMuted);
  createText(t2, 'STATUS', 940, 56, 120, 16, 11, 'Bold', C.textMuted);

  const foodRows = [
    { title: 'Roti Sourdough & Croissant', cat: 'Roti dan Kue', rem: '3 / 6 porsi', exp: 'Hari ini 21:00', st: 'AVAILABLE' },
    { title: 'Sayur Hidroponik Campur Segar', cat: 'Buah & Sayur', rem: '4 / 4 ikat', exp: 'Besok 10:00', st: 'AVAILABLE' }
  ];
  foodRows.forEach((fr, idx) => {
    const ry = 86 + idx * 64;
    createText(t2, fr.title, 36, ry + 12, 280, 18, 13, 'Bold', C.textDark);
    createText(t2, fr.cat, 340, ry + 12, 160, 18, 12, 'Medium', C.textMuted);
    createText(t2, fr.rem, 540, ry + 12, 120, 18, 12, 'Bold', C.primary);
    createText(t2, fr.exp, 720, ry + 12, 180, 18, 12, 'Medium', C.warning);
    createBadge(t2, fr.st, 940, ry + 8, C.successBg, C.success);
  });
}

// 9. s12_modal_bagikan_makanan
function buildScreen9(parentId, x, y) {
  const frame = createFrame(parentId, '09 - Modal Bagikan Makanan Baru (s12)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Bagikan Makanan', 'Makanan Saya');
  // Gentle Scrim
  createRect(frame, 'Modal Scrim Backdrop', 0, 0, 1440, 900, C.scrim);

  const modal = createFrame(frame, 'Create Food Modal', 440, 40, 560, 820, C.surface, 24);
  createRect(modal, 'Modal Border', 0, 0, 560, 820, null, 24, { color: C.border });

  createText(modal, 'Bagikan Makanan Baru', 28, 24, 400, 24, 18, 'Bold', C.textDark);
  createText(modal, '✕', 510, 24, 24, 24, 16, 'Bold', C.textMuted);

  // Dropzone foto
  createRect(modal, 'Upload Zone', 28, 64, 504, 110, C.primaryTint, 12, { color: C.primaryLight });
  createText(modal, '📷 Ketuk untuk unggah foto makanan real-time', 100, 100, 360, 20, 13, 'Semi Bold', C.primary);
  createText(modal, 'Format JPG, PNG maksimal 5MB. Pastikan kondisi makanan terlihat jelas.', 70, 124, 420, 18, 11, 'Medium', C.textMuted);

  const fields = [
    { label: 'Nama Makanan', val: 'Contoh: Nasi Goreng Spesial / Buah Apel Segar' },
    { label: 'Kategori Makanan', val: 'Pilih: Makanan Berat  ▼' },
    { label: 'Jumlah Porsi Tersedia', val: '4 Porsi' },
    { label: 'Batas Waktu Konsumsi (Best Before)', val: 'Hari ini, 21:00 WIB' },
    { label: 'Kelurahan / Lokasi Pengambilan', val: 'Tebet Barat, Jakarta Selatan' }
  ];

  let fy = 190;
  fields.forEach(f => {
    createText(modal, f.label, 28, fy, 504, 16, 11, 'Bold', C.textDark);
    createRect(modal, 'Input ' + f.label, 28, fy + 20, 504, 38, C.background, 10, { color: C.border });
    createText(modal, f.val, 40, fy + 30, 480, 18, 12, 'Medium', C.textDark);
    fy += 68;
  });

  // Catatan alergen
  createText(modal, 'Catatan Alergen / Suhu Simpan (Opsional)', 28, fy, 504, 16, 11, 'Bold', C.textDark);
  createRect(modal, 'Catatan Textarea', 28, fy + 20, 504, 56, C.background, 10, { color: C.border });
  createText(modal, 'Contoh: Mengandung telur dan kacang kedelai. Harap dihangatkan sebelum dikonsumsi.', 40, fy + 30, 480, 20, 11, 'Medium', C.textLight);

  // Guarantee checkbox
  createRect(modal, 'Check Box', 28, fy + 86, 18, 18, C.primaryLight, 6, { color: C.primary });
  createText(modal, '✓', 31, fy + 87, 14, 14, 11, 'Bold', C.primary);
  createText(modal, 'Saya menjamin makanan ini masih sangat layak konsumsi dan higienis.', 54, fy + 86, 480, 20, 11, 'Medium', C.textDark);

  // Action Buttons
  createButton(modal, 'Terbitkan Makanan Sekarang  →', 28, fy + 120, 504, 46, C.primaryContainer, C.white, 12);
}

// 10. s13_makanan_saya
function buildScreen10(parentId, x, y) {
  const frame = createFrame(parentId, '10 - Makanan Saya Donatur (s13)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Makanan Saya', 'Makanan Saya');

  const cx = 270;
  // Header
  createText(frame, 'Kelola Makanan yang Anda Bagikan', cx, 88, 600, 28, 22, 'Bold', C.textDark);
  createText(frame, 'Pantau status ketersediaan, edit informasi, atau tangani permintaan masuk.', cx, 120, 600, 20, 13, 'Medium', C.textMuted);
  createButton(frame, '+ Bagikan Makanan Baru', cx + 900, 88, 230, 44, C.primaryContainer, C.white, 12);

  // Filter Tabs
  const tabs = ['Semua (8)', 'Tersedia (3)', 'Dalam Proses (2)', 'Selesai Dibagikan (3)'];
  let tx = cx;
  tabs.forEach((t, idx) => {
    const isSel = idx === 0;
    const tabW = t.length * 8 + 24;
    createFrame(frame, 'Tab ' + t, tx, 156, tabW, 36, isSel ? C.primaryContainer : C.surface, 18);
    createText(frame, t, tx, 166, tabW, 18, 12, isSel ? 'Bold' : 'Medium', isSel ? C.white : C.textMuted);
    tx += tabW + 12;
  });

  // Food Management List Table
  const table = createFrame(frame, 'Makanan List Table', cx, 210, 1130, 640, C.surface, 16);
  createRect(table, 'Border', 0, 0, 1130, 640, null, 16, { color: C.border });

  createRect(table, 'THead', 24, 20, 1082, 36, C.background, 8);
  createText(table, 'MAKANAN', 40, 30, 280, 16, 11, 'Bold', C.textMuted);
  createText(table, 'KATEGORI', 340, 30, 140, 16, 11, 'Bold', C.textMuted);
  createText(table, 'SISA PORSI', 500, 30, 120, 16, 11, 'Bold', C.textMuted);
  createText(table, 'BATAS KONSUMSI', 660, 30, 160, 16, 11, 'Bold', C.textMuted);
  createText(table, 'STATUS', 840, 30, 120, 16, 11, 'Bold', C.textMuted);
  createText(table, 'AKSI', 980, 30, 120, 16, 11, 'Bold', C.textMuted);

  const rows = [
    { title: 'Roti Sourdough & Croissant', cat: 'Roti & Kue', p: '3/6 porsi', exp: 'Hari ini 21:00', st: 'AVAILABLE', bg: C.bakeryBg, icon: '🥐' },
    { title: 'Sayur Hidroponik Campur Segar', cat: 'Buah & Sayur', p: '4/4 ikat', exp: 'Besok 10:00', st: 'AVAILABLE', bg: C.veggieBg, icon: '🥬' },
    { title: 'Nasi Bento Ayam Teriyaki', cat: 'Makanan Berat', p: '0/5 porsi', exp: 'Selesai', st: 'COMPLETED', bg: C.bentoBg, icon: '🍱' },
    { title: 'Jus Buah Segar Botolan', cat: 'Minuman', p: '0/8 botol', exp: 'Selesai', st: 'COMPLETED', bg: C.juiceBg, icon: '🧃' },
    { title: 'Pisang Cavendish Organik', cat: 'Buah & Sayur', p: '1/3 paket', exp: 'Besok 12:00', st: 'IN_PROGRESS', bg: C.fruitBg, icon: '🍌' }
  ];

  rows.forEach((r, idx) => {
    const ry = 72 + idx * 72;
    createRect(table, 'Thumb ' + idx, 40, ry + 10, 44, 44, r.bg, 8);
    createText(table, r.icon, 52, ry + 20, 24, 24, 18, 'Bold', C.primary);
    createText(table, r.title, 96, ry + 14, 230, 18, 13, 'Bold', C.textDark);
    createText(table, 'Diunggah 2 jam lalu', 96, ry + 34, 230, 16, 10, 'Medium', C.textLight);

    createText(table, r.cat, 340, ry + 22, 140, 18, 12, 'Medium', C.textMuted);
    createText(table, r.p, 500, ry + 22, 120, 18, 12, 'Bold', C.primary);
    createText(table, r.exp, 660, ry + 22, 160, 18, 12, 'Medium', r.exp === 'Selesai' ? C.textMuted : C.warning);
    createBadge(table, r.st, 840, ry + 18, r.st === 'AVAILABLE' ? C.successBg : (r.st === 'IN_PROGRESS' ? C.warningBg : C.background), r.st === 'AVAILABLE' ? C.success : (r.st === 'IN_PROGRESS' ? C.warning : C.textMuted));

    createButton(table, 'Detail', 980, ry + 14, 60, 32, C.primaryLight, C.primary, 8);
    createButton(table, 'Edit', 1048, ry + 14, 54, 32, C.background, C.textDark, 8);
  });
}

// 11. s14_modal_edit_makanan
function buildScreen11(parentId, x, y) {
  const frame = createFrame(parentId, '11 - Modal Edit Makanan (s14)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Edit Makanan', 'Makanan Saya');
  createRect(frame, 'Modal Scrim Backdrop', 0, 0, 1440, 900, C.scrim);

  const modal = createFrame(frame, 'Edit Modal Container', 460, 80, 520, 720, C.surface, 24);
  createRect(modal, 'Modal Border', 0, 0, 520, 720, null, 24, { color: C.border });

  createText(modal, 'Edit Informasi Makanan', 28, 24, 400, 24, 18, 'Bold', C.textDark);
  createText(modal, '✕', 470, 24, 24, 24, 16, 'Bold', C.textMuted);

  const fields = [
    { label: 'Nama Makanan', val: 'Roti Sourdough & Croissant' },
    { label: 'Kategori Makanan', val: 'Roti dan Kue' },
    { label: 'Sisa Porsi Tersedia', val: '3 Porsi' },
    { label: 'Batas Waktu Konsumsi', val: 'Hari ini, 21:00 WIB' },
    { label: 'Lokasi Pengambilan', val: 'Tebet Barat (Radius 500m)' }
  ];

  let fy = 72;
  fields.forEach(f => {
    createText(modal, f.label, 28, fy, 464, 16, 11, 'Bold', C.textDark);
    createRect(modal, 'Edit Input ' + f.label, 28, fy + 20, 464, 38, C.background, 10, { color: C.border });
    createText(modal, f.val, 40, fy + 30, 440, 18, 12, 'Bold', C.textDark);
    fy += 68;
  });

  // Status Switcher
  createText(modal, 'Status Ketersediaan', 28, fy, 464, 16, 11, 'Bold', C.textDark);
  createRect(modal, 'Status Box', 28, fy + 20, 464, 40, C.primaryTint, 10, { color: C.primary });
  createText(modal, '🟢 Masih Tersedia (Dapat diajukan warga)', 40, fy + 31, 400, 18, 12, 'Bold', C.primary);

  // Buttons
  createButton(modal, 'Simpan Perubahan  →', 28, fy + 80, 464, 46, C.primaryContainer, C.white, 12);
  createButton(modal, 'Nonaktifkan Makanan Ini', 28, fy + 134, 464, 40, C.dangerBg, C.danger, 12);
}

// 12. s15_detail_makanan_saya
function buildScreen12(parentId, x, y) {
  const frame = createFrame(parentId, '12 - Detail Makanan Saya (s15)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Detail Makanan', 'Makanan Saya');

  const cx = 270;
  // Breadcrumb
  createText(frame, 'Dashboard  >  Makanan Saya  >  Roti Sourdough & Croissant', cx, 88, 600, 18, 12, 'Medium', C.textMuted);

  // Overview Card
  const overCard = createFrame(frame, 'Overview Card', cx, 116, 1130, 200, C.surface, 16);
  createRect(overCard, 'Border', 0, 0, 1130, 200, null, 16, { color: C.border });

  createRect(overCard, 'Banner Img', 24, 20, 220, 160, C.bakeryBg, 12);
  createText(overCard, '🥐', 110, 80, 50, 50, 40, 'Bold', C.primary);
  createBadge(overCard, 'AVAILABLE', 36, 32, C.successBg, C.success);

  createText(overCard, 'Roti Sourdough & Croissant', 270, 24, 500, 26, 20, 'Bold', C.textDark);
  createText(overCard, 'Kategori: Roti dan Kue • Lokasi: Tebet Barat', 270, 54, 500, 18, 12, 'Medium', C.textMuted);

  createBadge(overCard, 'Sisa: 3 / 6 Porsi', 270, 84, C.primaryLight, C.primary);
  createBadge(overCard, 'Batas: Hari ini 21:00 WIB', 400, 84, C.warningBg, C.warning);

  createButton(overCard, 'Edit Info Makanan', 930, 24, 170, 40, C.primaryLight, C.primary, 10);

  // Requesters Section
  createText(frame, 'Daftar Permintaan Pengambilan untuk Makanan Ini', cx, 336, 600, 22, 16, 'Bold', C.textDark);

  const reqTable = createFrame(frame, 'Requesters Table', cx, 368, 1130, 480, C.surface, 16);
  createRect(reqTable, 'Border', 0, 0, 1130, 480, null, 16, { color: C.border });

  createRect(reqTable, 'THead', 24, 20, 1082, 34, C.background, 6);
  createText(reqTable, 'PEMOHON', 40, 30, 200, 16, 11, 'Bold', C.textMuted);
  createText(reqTable, 'PORSI', 260, 30, 100, 16, 11, 'Bold', C.textMuted);
  createText(reqTable, 'WAKTU JEMPUT', 400, 30, 160, 16, 11, 'Bold', C.textMuted);
  createText(reqTable, 'CATATAN PEMOHON', 600, 30, 260, 16, 11, 'Bold', C.textMuted);
  createText(reqTable, 'AKSI', 900, 30, 160, 16, 11, 'Bold', C.textMuted);

  const reqs = [
    { name: 'Siti Rahma', p: '2 Porsi', time: 'Hari ini 17:00', note: 'Membawa kotak makan sendiri dari rumah' },
    { name: 'Ahmad Fauzi', p: '1 Porsi', time: 'Hari ini 18:30', note: 'Akan mampir sepulang kerja' }
  ];

  reqs.forEach((rq, idx) => {
    const ry = 68 + idx * 72;
    createText(reqTable, rq.name, 40, ry + 14, 200, 18, 13, 'Bold', C.textDark);
    createText(reqTable, rq.p, 260, ry + 14, 100, 18, 12, 'Bold', C.primary);
    createText(reqTable, rq.time, 400, ry + 14, 160, 18, 12, 'Medium', C.textDark);
    createText(reqTable, rq.note, 600, ry + 14, 260, 36, 11, 'Medium', C.textMuted);
    createButton(reqTable, 'Setujui Permintaan', 880, ry + 8, 130, 34, C.primaryContainer, C.white, 8);
    createButton(reqTable, 'Tolak', 1020, ry + 8, 60, 34, C.dangerBg, C.danger, 8);
  });
}

// 13. s18_makanan_diambil
function buildScreen13(parentId, x, y) {
  const frame = createFrame(parentId, '13 - Makanan Diambil Penerima (s18)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Makanan Diambil', 'Makanan Diambil');

  const cx = 270;
  createText(frame, 'Makanan yang Saya Ambil (Sebagai Penerima)', cx, 88, 600, 28, 22, 'Bold', C.textDark);
  createText(frame, 'Pantau status permohonan, jadwal pengambilan, dan detail alamat penjemputan.', cx, 120, 600, 20, 13, 'Medium', C.textMuted);

  // Tabs
  const tabs = ['Semua (6)', 'Menunggu Respon (2)', 'Disetujui Donatur (2)', 'Selesai (2)'];
  let tx = cx;
  tabs.forEach((t, idx) => {
    const isSel = idx === 0;
    const tabW = t.length * 8 + 24;
    createFrame(frame, 'Tab ' + t, tx, 156, tabW, 36, isSel ? C.primaryContainer : C.surface, 18);
    createText(frame, t, tx, 166, tabW, 18, 12, isSel ? 'Bold' : 'Medium', isSel ? C.white : C.textMuted);
    tx += tabW + 12;
  });

  // Table
  const table = createFrame(frame, 'Claim Table', cx, 210, 1130, 640, C.surface, 16);
  createRect(table, 'Border', 0, 0, 1130, 640, null, 16, { color: C.border });

  createRect(table, 'THead', 24, 20, 1082, 34, C.background, 6);
  createText(table, 'MAKANAN', 40, 30, 260, 16, 11, 'Bold', C.textMuted);
  createText(table, 'DONATUR', 320, 30, 160, 16, 11, 'Bold', C.textMuted);
  createText(table, 'PORSI', 500, 30, 100, 16, 11, 'Bold', C.textMuted);
  createText(table, 'JADWAL JEMPUT', 640, 30, 160, 16, 11, 'Bold', C.textMuted);
  createText(table, 'STATUS', 820, 30, 120, 16, 11, 'Bold', C.textMuted);
  createText(table, 'AKSI', 970, 30, 120, 16, 11, 'Bold', C.textMuted);

  const claims = [
    { title: 'Roti Sourdough & Croissant', donor: 'Budi Santoso', p: '2 Porsi', time: 'Hari ini 17:00', st: 'APPROVED', bg: C.bakeryBg, icon: '🥐' },
    { title: 'Sayur Hidroponik Campur', donor: 'Ibu Ratna', p: '1 Ikat', time: 'Besok 09:30', st: 'PENDING', bg: C.veggieBg, icon: '🥬' },
    { title: 'Nasi Kotak Ayam Madu', donor: 'Resto Berkah', p: '2 Kotak', time: 'Kemarin 19:00', st: 'COMPLETED', bg: C.bentoBg, icon: '🍱' }
  ];

  claims.forEach((cl, idx) => {
    const ry = 68 + idx * 72;
    createRect(table, 'Thumb ' + idx, 40, ry + 10, 44, 44, cl.bg, 8);
    createText(table, cl.icon, 52, ry + 20, 24, 24, 18, 'Bold', C.primary);
    createText(table, cl.title, 96, ry + 14, 210, 18, 13, 'Bold', C.textDark);
    createText(table, 'Permintaan #' + (8290 + idx), 96, ry + 34, 210, 16, 10, 'Medium', C.textLight);

    createText(table, cl.donor, 320, ry + 22, 160, 18, 12, 'Medium', C.textDark);
    createText(table, cl.p, 500, ry + 22, 100, 18, 12, 'Bold', C.primary);
    createText(table, cl.time, 640, ry + 22, 160, 18, 12, 'Medium', C.textMuted);

    const stBg = cl.st === 'APPROVED' ? C.successBg : (cl.st === 'PENDING' ? C.warningBg : C.background);
    const stTx = cl.st === 'APPROVED' ? C.success : (cl.st === 'PENDING' ? C.warning : C.textMuted);
    createBadge(table, cl.st, 820, ry + 18, stBg, stTx);

    createButton(table, cl.st === 'APPROVED' ? 'Buka Alamat' : 'Detail', 970, ry + 14, 110, 32, cl.st === 'APPROVED' ? C.primaryContainer : C.primaryLight, cl.st === 'APPROVED' ? C.white : C.primary, 8);
  });
}

// 14. s19_detail_diambil_approved
function buildScreen14(parentId, x, y) {
  const frame = createFrame(parentId, '14 - Detail Pengambilan Approved (s19)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Pengambilan Disetujui', 'Makanan Diambil');
  createRect(frame, 'Modal Scrim Backdrop', 0, 0, 1440, 900, C.scrim);

  const modal = createFrame(frame, 'Approved Modal Container', 440, 60, 560, 760, C.surface, 24);
  createRect(modal, 'Modal Border', 0, 0, 560, 760, null, 24, { color: C.border });

  // Success Banner
  createRect(modal, 'Success Banner', 0, 0, 560, 100, C.primaryContainer, 0);
  createText(modal, '🎉 Permintaan Anda Telah Disetujui!', 28, 24, 460, 24, 18, 'Bold', C.white);
  createText(modal, 'Donatur telah memverifikasi jadwal Anda. Silakan jemput makanan tepat waktu.', 28, 54, 480, 20, 12, 'Medium', C.primaryLight);

  // Food summary
  createText(modal, 'Ringkasan Makanan', 28, 120, 504, 18, 13, 'Bold', C.textDark);
  createRect(modal, 'Food Summary Box', 28, 144, 504, 70, C.background, 12, { color: C.borderLight });
  createRect(modal, 'Thumb', 40, 154, 50, 50, C.bakeryBg, 8);
  createText(modal, '🥐', 52, 166, 26, 26, 20, 'Bold', C.primary);
  createText(modal, 'Roti Sourdough & Croissant (2 Porsi)', 104, 158, 380, 20, 13, 'Bold', C.textDark);
  createText(modal, 'Jadwal Pengambilan: Hari ini, Pukul 17:00 WIB', 104, 180, 380, 18, 11, 'Medium', C.textMuted);

  // Alamat Lengkap Terverifikasi
  createText(modal, 'Alamat Lengkap Donatur (Terverifikasi)', 28, 234, 504, 18, 13, 'Bold', C.textDark);
  createRect(modal, 'Address Box', 28, 258, 504, 110, C.primaryTint, 12, { color: C.primaryLight });
  createText(modal, '📍 Jl. Tebet Barat Dalam VII No. 14, RT 04 / RW 02', 44, 272, 460, 20, 13, 'Bold', C.primary);
  createText(modal, 'Kel. Tebet Barat, Kec. Tebet, Jakarta Selatan (Pagar hitam, samping musholla)', 44, 296, 460, 20, 11, 'Medium', C.textDark);
  createButton(modal, 'Buka di Google Maps  ↗', 44, 324, 180, 32, C.primaryLight, C.primary, 8);

  // PIN / Kode Pengambilan
  createText(modal, 'Kode Verifikasi Pengambilan', 28, 388, 504, 18, 13, 'Bold', C.textDark);
  createRect(modal, 'PIN Box', 28, 412, 504, 70, C.background, 12, { color: C.border });
  createText(modal, '#SF-8291', 200, 424, 200, 32, 24, 'Bold', C.primary);
  createText(modal, 'Tunjukkan kode ini kepada donatur saat serah terima makanan', 70, 456, 400, 18, 11, 'Medium', C.textLight);

  // Donatur Contact
  createText(modal, 'Kontak Donatur:', 28, 500, 504, 18, 13, 'Bold', C.textDark);
  createText(modal, 'Budi Santoso • WhatsApp: 0812-3456-7890', 28, 524, 504, 20, 12, 'Medium', C.textMuted);
  createButton(modal, 'Chat WhatsApp Donatur  💬', 28, 552, 240, 40, C.successBg, C.success, 10);

  // Confirm Button
  createButton(modal, 'Saya Sudah Mengambil Makanan  ✓', 28, 670, 504, 46, C.primaryContainer, C.white, 12);
}

// 15. s22_permintaan_masuk
function buildScreen15(parentId, x, y) {
  const frame = createFrame(parentId, '15 - Permintaan Masuk Warga (s22)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Permintaan Masuk', 'Permintaan Masuk');

  const cx = 270;
  createText(frame, 'Permintaan Masuk dari Warga Sekitar', cx, 88, 600, 28, 22, 'Bold', C.textDark);
  createText(frame, 'Tinjau dan setujui permohonan pengambilan makanan sebelum waktu batas berakhir.', cx, 120, 600, 20, 13, 'Medium', C.textMuted);

  // Group Card 1: Roti Sourdough
  const g1 = createFrame(frame, 'Group Card Roti', cx, 160, 1130, 320, C.surface, 16);
  createRect(g1, 'Border', 0, 0, 1130, 320, null, 16, { color: C.border });

  createRect(g1, 'Head Bar', 0, 0, 1130, 56, C.primaryTint, 0);
  createText(g1, '🍲 Roti Sourdough & Croissant (Sisa: 3 porsi dari 6)', 24, 18, 500, 20, 14, 'Bold', C.primary);
  createBadge(g1, 'Batas: 21:00 WIB', 980, 16, C.warningBg, C.warning);

  // Requester 1
  const r1 = createFrame(g1, 'Req Siti', 24, 72, 1082, 100, C.background, 12);
  createRect(r1, 'Border', 0, 0, 1082, 100, null, 12, { color: C.borderLight });
  createRect(r1, 'Avatar', 20, 20, 48, 48, C.primaryLight, 24);
  createText(r1, 'SR', 20, 32, 48, 20, 14, 'Bold', C.primary);

  createText(r1, 'Siti Rahma (Warga Terverifikasi Tebet Barat)', 84, 20, 400, 20, 14, 'Bold', C.textDark);
  createText(r1, 'Permintaan: 2 Porsi • Jam Ambil: 17:00 WIB • Catatan: Membawa wadah kain sendiri', 84, 44, 600, 18, 12, 'Medium', C.textMuted);
  createButton(r1, 'Setujui Permintaan', 800, 28, 160, 40, C.primaryContainer, C.white, 10);
  createButton(r1, 'Tolak', 976, 28, 80, 40, C.dangerBg, C.danger, 10);

  // Requester 2
  const r2 = createFrame(g1, 'Req Ahmad', 24, 188, 1082, 100, C.background, 12);
  createRect(r2, 'Border', 0, 0, 1082, 100, null, 12, { color: C.borderLight });
  createRect(r2, 'Avatar', 20, 20, 48, 48, C.fruitBg, 24);
  createText(r2, 'AF', 20, 32, 48, 20, 14, 'Bold', C.warning);

  createText(r2, 'Ahmad Fauzi (Warga RT 02)', 84, 20, 400, 20, 14, 'Bold', C.textDark);
  createText(r2, 'Permintaan: 1 Porsi • Jam Ambil: 18:30 WIB • Catatan: Sepulang kantor', 84, 44, 600, 18, 12, 'Medium', C.textMuted);
  createButton(r2, 'Setujui Permintaan', 800, 28, 160, 40, C.primaryContainer, C.white, 10);
  createButton(r2, 'Tolak', 976, 28, 80, 40, C.dangerBg, C.danger, 10);

  // Group Card 2: Sayur Hidroponik
  const g2 = createFrame(frame, 'Group Card Sayur', cx, 500, 1130, 200, C.surface, 16);
  createRect(g2, 'Border', 0, 0, 1130, 200, null, 16, { color: C.border });

  createRect(g2, 'Head Bar', 0, 0, 1130, 56, C.background, 0);
  createText(g2, '🥬 Sayur Hidroponik Campur Segar (Sisa: 4 ikat)', 24, 18, 500, 20, 14, 'Bold', C.textDark);
  createBadge(g2, 'Batas: Besok 10:00', 980, 16, C.primaryLight, C.primary);

  createText(g2, 'Belum ada permohonan baru untuk makanan ini. Status tetap aktif di katalog warga.', 40, 100, 800, 20, 13, 'Medium', C.textLight);
}

// 16. s24_riwayat
function buildScreen16(parentId, x, y) {
  const frame = createFrame(parentId, '16 - Riwayat & Arsip Transaksi (s24)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Riwayat Transaksi', 'Riwayat & Dampak');

  const cx = 270;
  createText(frame, 'Riwayat Transaksi & Dampak Lingkungan', cx, 88, 600, 28, 22, 'Bold', C.textDark);
  createText(frame, 'Arsip lengkap makanan yang Anda bagikan dan terima bersama catatan jejak karbon.', cx, 120, 600, 20, 13, 'Medium', C.textMuted);
  createButton(frame, '📥 Unduh Laporan CSV', cx + 930, 88, 200, 42, C.primaryLight, C.primary, 10);

  // Impact Summary Strip
  const strip = createFrame(frame, 'Impact Strip', cx, 160, 1130, 100, C.primaryTint, 16);
  createRect(strip, 'Border', 0, 0, 1130, 100, null, 16, { color: C.borderLight });

  createText(strip, '48 Paket', 40, 24, 200, 28, 24, 'Bold', C.primary);
  createText(strip, 'Total makanan diselamatkan', 40, 56, 200, 18, 11, 'Medium', C.textMuted);

  createText(strip, '64.2 kg CO2e', 340, 24, 200, 28, 24, 'Bold', C.primaryContainer);
  createText(strip, 'Jejak gas emisi berhasil dicegah', 340, 56, 240, 18, 11, 'Medium', C.textMuted);

  createText(strip, '18 Warga', 660, 24, 200, 28, 24, 'Bold', C.textDark);
  createText(strip, 'Warga sekitar yang saling terhubung', 660, 56, 240, 18, 11, 'Medium', C.textMuted);

  createText(strip, '100% Bersih', 940, 24, 200, 28, 24, 'Bold', C.success);
  createText(strip, 'Rating kepuasan & keamanan pangan', 940, 56, 240, 18, 11, 'Medium', C.textMuted);

  // History Table
  const table = createFrame(frame, 'History Table', cx, 280, 1130, 580, C.surface, 16);
  createRect(table, 'Border', 0, 0, 1130, 580, null, 16, { color: C.border });

  createRect(table, 'THead', 24, 20, 1082, 34, C.background, 6);
  createText(table, 'TANGGAL', 40, 30, 140, 16, 11, 'Bold', C.textMuted);
  createText(table, 'MAKANAN', 200, 30, 260, 16, 11, 'Bold', C.textMuted);
  createText(table, 'PERAN', 480, 30, 120, 16, 11, 'Bold', C.textMuted);
  createText(table, 'MITRA WARGA', 620, 30, 160, 16, 11, 'Bold', C.textMuted);
  createText(table, 'DAMPAK CO2', 800, 30, 140, 16, 11, 'Bold', C.textMuted);
  createText(table, 'STATUS', 960, 30, 120, 16, 11, 'Bold', C.textMuted);

  const hist = [
    { date: '15 Nov 2026', food: 'Nasi Bento Ayam Teriyaki (5 porsi)', role: 'Donatur', partner: 'Ahmad, Siti, Doni', co2: '-3.2 kg CO2e', st: 'SELESAI' },
    { date: '12 Nov 2026', food: 'Sayur Bayam & Jagung Segar (2 ikat)', role: 'Penerima', partner: 'Ibu Ratna', co2: '-1.4 kg CO2e', st: 'SELESAI' },
    { date: '08 Nov 2026', food: 'Roti Gandum Manis (4 buah)', role: 'Donatur', partner: 'Pak Hendra', co2: '-2.1 kg CO2e', st: 'SELESAI' },
    { date: '01 Nov 2026', food: 'Jus Mangga Cold-Pressed (3 botol)', role: 'Penerima', partner: 'Kafe Berbagi', co2: '-1.8 kg CO2e', st: 'SELESAI' }
  ];

  hist.forEach((h, idx) => {
    const ry = 68 + idx * 64;
    createText(table, h.date, 40, ry + 14, 140, 18, 12, 'Medium', C.textMuted);
    createText(table, h.food, 200, ry + 14, 260, 18, 12, 'Bold', C.textDark);
    createText(table, h.role, 480, ry + 14, 120, 18, 12, 'Semi Bold', h.role === 'Donatur' ? C.primary : C.primaryContainer);
    createText(table, h.partner, 620, ry + 14, 160, 18, 12, 'Medium', C.textDark);
    createText(table, h.co2, 800, ry + 14, 140, 18, 12, 'Bold', C.success);
    createBadge(table, h.st, 960, ry + 12, C.successBg, C.success);
  });
}

// 17. s25_profil
function buildScreen17(parentId, x, y) {
  const frame = createFrame(parentId, '17 - Profil & Keamanan Akun (s25)', x, y, 1440, 900, C.background);
  renderDashboardShell(frame, 'Pengaturan Profil', 'Profil & Pengaturan');

  const cx = 270;
  createText(frame, 'Profil Pengguna & Keamanan Akun', cx, 88, 600, 28, 22, 'Bold', C.textDark);
  createText(frame, 'Perbarui identitas warga, nomor WhatsApp, serta kelola preferensi notifikasi.', cx, 120, 600, 20, 13, 'Medium', C.textMuted);

  // Left Col: Profile Form (540w)
  const pForm = createFrame(frame, 'Profile Card', cx, 160, 540, 680, C.surface, 16);
  createRect(pForm, 'Border', 0, 0, 540, 680, null, 16, { color: C.border });

  createRect(pForm, 'Avatar Big', 24, 24, 72, 72, C.primaryLight, 36);
  createText(pForm, 'BS', 24, 46, 72, 28, 20, 'Bold', C.primary);
  createText(pForm, 'Budi Santoso', 112, 32, 300, 22, 16, 'Bold', C.textDark);
  createText(pForm, 'Warga Terverifikasi • Bergabung sejak Okt 2026', 112, 58, 300, 18, 11, 'Medium', C.textMuted);

  const pfields = [
    { label: 'Nama Lengkap Sesuai KTP', val: 'Budi Santoso' },
    { label: 'Nomor WhatsApp (Untuk Koordinasi Jemput)', val: '0812-3456-7890' },
    { label: 'Alamat Email', val: 'budi@warga.id' },
    { label: 'Kelurahan / Kecamatan', val: 'Tebet Barat, Tebet, Jakarta Selatan' },
    { label: 'Detail Alamat Rumah (Hanya muncul jika disetujui)', val: 'Jl. Tebet Barat Dalam VII No. 14' }
  ];

  let py = 120;
  pfields.forEach(pf => {
    createText(pForm, pf.label, 24, py, 492, 16, 11, 'Bold', C.textDark);
    createRect(pForm, 'Input ' + pf.label, 24, py + 20, 492, 38, C.background, 10, { color: C.border });
    createText(pForm, pf.val, 36, py + 30, 460, 18, 12, 'Bold', C.textDark);
    py += 68;
  });

  createButton(pForm, 'Simpan Perubahan Profil', 24, py + 20, 492, 44, C.primaryContainer, C.white, 12);

  // Right Col: Security & Preferences (560w)
  const rx = cx + 570;

  // Notification Box
  const nBox = createFrame(frame, 'Notif Card', rx, 160, 560, 260, C.surface, 16);
  createRect(nBox, 'Border', 0, 0, 560, 260, null, 16, { color: C.border });
  createText(nBox, 'Preferensi Pemberitahuan', 24, 20, 400, 22, 15, 'Bold', C.textDark);

  const notifs = [
    { title: 'Notifikasi WhatsApp Permintaan Masuk', desc: 'Terima pesan instan saat warga meminta makanan Anda' },
    { title: 'Pemberitahuan Makanan Baru di Sekitar', desc: 'Dapatkan info saat tetangga membagikan makanan dalam radius 1km' },
    { title: 'Pengingat Waktu Batas Pengambilan', desc: 'Peringatan 2 jam sebelum batas kadaluarsa berakhir' }
  ];
  notifs.forEach((nt, idx) => {
    const ny = 58 + idx * 60;
    createText(nBox, nt.title, 24, ny, 420, 18, 12, 'Bold', C.textDark);
    createText(nBox, nt.desc, 24, ny + 18, 420, 16, 10, 'Medium', C.textMuted);
    createBadge(nBox, 'AKTIF', 480, ny + 8, C.successBg, C.success);
  });

  // Password Update Box
  const pwBox = createFrame(frame, 'Password Card', rx, 440, 560, 240, C.surface, 16);
  createRect(pwBox, 'Border', 0, 0, 560, 240, null, 16, { color: C.border });
  createText(pwBox, 'Ubah Kata Sandi', 24, 20, 400, 22, 15, 'Bold', C.textDark);

  createText(pwBox, 'Kata Sandi Saat Ini', 24, 52, 240, 16, 11, 'Bold', C.textDark);
  createRect(pwBox, 'PW1', 24, 72, 512, 36, C.background, 8, { color: C.border });
  createText(pwBox, '••••••••••••', 36, 81, 400, 18, 12, 'Bold', C.textDark);

  createText(pwBox, 'Kata Sandi Baru', 24, 118, 240, 16, 11, 'Bold', C.textDark);
  createRect(pwBox, 'PW2', 24, 138, 512, 36, C.background, 8, { color: C.border });
  createText(pwBox, '••••••••••••', 36, 147, 400, 18, 12, 'Bold', C.textDark);

  createButton(pwBox, 'Perbarui Kata Sandi', 24, 186, 200, 36, C.primaryLight, C.primary, 8);

  // Danger zone
  const dBox = createFrame(frame, 'Danger Card', rx, 700, 560, 140, C.surface, 16);
  createRect(dBox, 'Border', 0, 0, 560, 140, null, 16, { color: C.dangerBg });
  createText(dBox, 'Zona Bahaya', 24, 20, 400, 22, 14, 'Bold', C.danger);
  createText(dBox, 'Menonaktifkan akun warga akan menghapus seluruh data makanan aktif dan reputasi Anda.', 24, 46, 500, 36, 11, 'Medium', C.textMuted);
  createButton(dBox, 'Nonaktifkan Akun Warga', 24, 88, 220, 36, C.dangerBg, C.danger, 8);
}

// ==========================================
// MAIN EXECUTION PIPELINE
// ==========================================
function main() {
  console.log('1. Creating Document Pages...');
  const page1Id = createPage(100, 'Web ShareFood - High Fidelity Designs (1440x900)');
  const page2Id = createPage(200, 'Design System & UI Kit Tokens');

  console.log('2. Populating Page 1 with 17 Screens in Clean Two-Row Layout...');
  
  // ROW 1: Alur Publik Warga (Screens 1 to 7) at y = 0
  const row1Screens = [
    { fn: buildScreen1, name: '01 - Beranda' },
    { fn: buildScreen2, name: '02 - Katalog' },
    { fn: buildScreen3, name: '03 - Detail Modal' },
    { fn: buildScreen4, name: '04 - Ambil Dialog' },
    { fn: buildScreen5, name: '05 - Panduan' },
    { fn: buildScreen6, name: '06 - Login' },
    { fn: buildScreen7, name: '07 - Register' }
  ];

  row1Screens.forEach((sc, i) => {
    const sx = i * 1560;
    const sy = 0;
    console.log(` - Row 1 [Publik]: Building Screen ${i + 1}/7 (${sc.name}) at [${sx}, ${sy}]...`);
    sc.fn(page1Id, sx, sy);
  });

  // ROW 2: Alur Dashboard Warga & Donatur (Screens 8 to 17) at y = 1150
  const row2Screens = [
    { fn: buildScreen8, name: '08 - Dashboard' },
    { fn: buildScreen9, name: '09 - Modal Bagikan' },
    { fn: buildScreen10, name: '10 - Makanan Saya' },
    { fn: buildScreen11, name: '11 - Modal Edit' },
    { fn: buildScreen12, name: '12 - Detail Makanan Saya' },
    { fn: buildScreen13, name: '13 - Makanan Diambil' },
    { fn: buildScreen14, name: '14 - Detail Approved' },
    { fn: buildScreen15, name: '15 - Permintaan Masuk' },
    { fn: buildScreen16, name: '16 - Riwayat' },
    { fn: buildScreen17, name: '17 - Profil' }
  ];

  row2Screens.forEach((sc, i) => {
    const sx = i * 1560;
    const sy = 1150;
    console.log(` - Row 2 [Dashboard]: Building Screen ${i + 8}/17 (${sc.name}) at [${sx}, ${sy}]...`);
    sc.fn(page1Id, sx, sy);
  });

  console.log('3. Populating Page 2 with Design System UI Kit...');
  // UI Kit Frame
  const kitFrame = createFrame(page2Id, '00 - ShareFood UI Component Kit & Tokens (1440x900)', 0, 0, 1440, 900, C.background);
  createBadge(kitFrame, 'SHAREFOOD DESIGN SYSTEM v1.0', 80, 40, C.primaryLight, C.primary);
  createText(kitFrame, 'Design Tokens & UI Component Specifications', 80, 68, 700, 32, 24, 'Bold', C.textDark);
  createText(kitFrame, 'Standar tipografi Montserrat, palet warna alam hijau, radius sudut, elevasi, dan komponen atom.', 80, 102, 700, 20, 13, 'Medium', C.textMuted);

  // Palet Warna
  createText(kitFrame, 'Palet Warna Brand & Semantik', 80, 140, 400, 22, 15, 'Bold', C.textDark);
  const colors = [
    { name: 'Primary Green', hex: '#006C45', c: C.primary, tc: C.white },
    { name: 'Container Green', hex: '#23865B', c: C.primaryContainer, tc: C.white },
    { name: 'Light Badge', hex: '#D8F2E5', c: C.primaryLight, tc: C.primary },
    { name: 'Canvas Dark', hex: '#0A2617', c: C.textDark, tc: C.white },
    { name: 'Muted Text', hex: '#526056', c: C.textMuted, tc: C.white },
    { name: 'Warning Amber', hex: '#B26A00', c: C.warning, tc: C.white },
    { name: 'Danger Red', hex: '#C94B45', c: C.danger, tc: C.white }
  ];
  colors.forEach((col, idx) => {
    const cx = 80 + idx * 180;
    const swatch = createFrame(kitFrame, 'Swatch: ' + col.name, cx, 170, 165, 80, col.c, 12);
    createText(swatch, col.name, 12, 16, 140, 18, 11, 'Bold', col.tc);
    createText(swatch, col.hex, 12, 40, 140, 18, 12, 'Medium', col.tc);
  });

  // Food Card Master Component
  createText(kitFrame, 'Spesifikasi Atom Card Makanan (Master Component)', 80, 280, 600, 22, 15, 'Bold', C.textDark);
  renderFoodCard(kitFrame, 80, 310, 320, 280, foodItemsCatalog[0]);

  const docFrame = createFrame(kitFrame, 'Doc Atom Frame', 430, 310, 930, 280, C.surface, 16);
  createRect(docFrame, 'Border', 0, 0, 930, 280, null, 16, { color: C.border });
  createText(docFrame, 'Aturan Baku Komponen Food Card:', 24, 20, 600, 20, 14, 'Bold', C.primary);
  createText(docFrame, '1. Ukuran proporsional: 300px - 320px lebar dengan rasio gambar 4:3 (tinggi 135px).\n2. Latar visual tematik membedakan kategori (roti hangat, sayur hijau, bento oranye, minuman biru).\n3. Badge status (AVAILABLE / PENDING) diposisikan di pojok kiri atas dengan sudut rounded-full.\n4. Tag kategori produk diposisikan di pojok kanan bawah gambar dengan latar semi-transparan.\n5. Informasi porsi menggunakan penekanan warna primer hijau (#23865B) dan tebal (Bold).\n6. Peringatan batas waktu kadaluarsa menggunakan warna aksen amber (#B26A00).\n7. Tombol CTA menggunakan lebar penuh (full-width) dengan radius sudut rounded-10px.', 24, 52, 880, 180, 12, 'Medium', C.textDark);

  console.log('4. Assembling Complete FigCraft Document JSON...');
  const doc = {
    version: 1,
    format: 'figcraft',
    name: 'sharefood_design',
    current_page: page1Id,
    pages: [page1Id, page2Id],
    nodes: nodes,
    styles: [],
    variables: [],
    comments: [],
    document_colors: [],
    imageIndex: 0,
    next_id: nextId + 1000
  };

  const jsonPath = 'd:/TUGAS_KULIAH/SEMESTER_5/claude-computing/sharefood/desain/sharefood_perfect_gen.json';
  const figcraftPath = 'd:/TUGAS_KULIAH/SEMESTER_5/claude-computing/sharefood/desain/sharefood_design.figcraft';

  console.log(`Writing JSON (${Object.keys(nodes).length} nodes) to ${jsonPath}...`);
  fs.writeFileSync(jsonPath, JSON.stringify(doc));

  console.log('Converting JSON to native .figcraft format via figcraft-cli...');
  execSync(`"D:\\FIGCRAFT\\FigCraft\\figcraft-cli.exe" convert "${jsonPath}" "${figcraftPath}"`);

  console.log('Removing temporary intermediate JSON file...');
  fs.unlinkSync(jsonPath);

  console.log('Verifying generated .figcraft file with figcraft-cli info:');
  const info = execSync(`"D:\\FIGCRAFT\\FigCraft\\figcraft-cli.exe" info "${figcraftPath}"`).toString();
  console.log(info);

  console.log('=== SUCCESS! PERFECT HIGH-FIDELITY FIGCRAFT DESIGN GENERATED ===');
}

main();
