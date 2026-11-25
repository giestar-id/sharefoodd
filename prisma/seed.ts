import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ShareFood database (3 Demo Accounts, 2 Products Each)...');

  // 1. Clean existing records in reverse dependency order
  await prisma.activity.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.pickupDetail.deleteMany();
  await prisma.foodImage.deleteMany();
  await prisma.food.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appSetting.deleteMany();

  // 2. Seed Demo Users
  const demoUsers = [
    {
      id: 'user-hendra',
      name: 'Hendra Bakery',
      email: 'hendra@bakery.com',
      phone: '081234567802',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      roleBadge: 'Mitra UMKM',
      joinedDate: 'November 2026',
    },
    {
      id: 'user-budi',
      name: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      phone: '081234567801',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      roleBadge: 'Warga Terverifikasi',
      joinedDate: 'November 2026',
    },
    {
      id: 'user-siti',
      name: 'Siti Rahma',
      email: 'siti.rahma@email.com',
      phone: '081234567803',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      roleBadge: 'Warga Terverifikasi',
      joinedDate: 'November 2026',
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        ...user,
        sharedCount: 0,
        receivedCount: 0,
      },
    });
  }

  // 3. Seed 6 Foods (2 per demo account: 1 Gratis, 1 Berbayar)
  const items = [
    {
      id: 'food-hendra-gratis',
      userId: 'user-hendra',
      ownerName: 'Hendra Bakery',
      title: 'Pastry Croissant Butter & Danishes',
      category: 'roti_kue',
      type: 'gratis',
      price: 0,
      quantity: 5,
      pickupDeadline: 'Hari ini, 20:00 WIB',
      addressNote: 'Toko Hendra Bakery pintu samping',
      whatsappNumber: '081234567802',
      mapsUrl: 'https://www.google.com/maps/@-7.4241,109.2303,17z',
      latitude: -7.4241,
      longitude: 109.2303,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'food-hendra-bayar',
      userId: 'user-hendra',
      ownerName: 'Hendra Bakery',
      title: 'Box 4 Donat Artisan Hemat',
      category: 'berbayar',
      type: 'berbayar',
      price: 12000,
      quantity: 4,
      pickupDeadline: 'Hari ini, 21:00 WIB',
      addressNote: 'Toko Hendra Bakery meja kasir',
      whatsappNumber: '081234567802',
      mapsUrl: 'https://www.google.com/maps/@-7.4241,109.2303,17z',
      latitude: -7.4241,
      longitude: 109.2303,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'food-budi-gratis',
      userId: 'user-budi',
      ownerName: 'Budi Santoso',
      title: 'Nasi Bento Ayam Teriyaki',
      category: 'makanan_berat',
      type: 'gratis',
      price: 0,
      quantity: 4,
      pickupDeadline: 'Hari ini, 20:30 WIB',
      addressNote: 'Jl. HR Bunyamin No. 12, depan Apotek Sehat',
      whatsappNumber: '081234567801',
      mapsUrl: 'https://www.google.com/maps/@-7.4125,109.2485,17z',
      latitude: -7.4125,
      longitude: 109.2485,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'food-budi-bayar',
      userId: 'user-budi',
      ownerName: 'Budi Santoso',
      title: 'Paket Nasi Rames Komplit (Closing Sale)',
      category: 'berbayar',
      type: 'berbayar',
      price: 10000,
      quantity: 5,
      pickupDeadline: 'Hari ini, 21:30 WIB',
      addressNote: 'Jl. HR Bunyamin No. 12, dekat Pos Ronda',
      whatsappNumber: '081234567801',
      mapsUrl: 'https://www.google.com/maps/@-7.4130,109.2490,17z',
      latitude: -7.4130,
      longitude: 109.2490,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'food-siti-gratis',
      userId: 'user-siti',
      ownerName: 'Siti Rahma',
      title: 'Sayur Lodeh & Tempe Bacem Hangat',
      category: 'makanan_berat',
      type: 'gratis',
      price: 0,
      quantity: 6,
      pickupDeadline: 'Hari ini, 19:30 WIB',
      addressNote: 'Rumah Ibu Siti, Gang Melati No. 8',
      whatsappNumber: '081234567803',
      mapsUrl: 'https://www.google.com/maps/@-7.4310,109.2410,17z',
      latitude: -7.4310,
      longitude: 109.2410,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'food-siti-bayar',
      userId: 'user-siti',
      ownerName: 'Siti Rahma',
      title: 'Es Kopi Susu Aren & Brownies',
      category: 'berbayar',
      type: 'berbayar',
      price: 9000,
      quantity: 5,
      pickupDeadline: 'Hari ini, 21:30 WIB',
      addressNote: 'Kopi & Dapur Siti, Gang Anggrek No. 3',
      whatsappNumber: '081234567803',
      mapsUrl: 'https://www.google.com/maps/@-7.4290,109.2380,17z',
      latitude: -7.4290,
      longitude: 109.2380,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
    },
  ];

  for (const item of items) {
    const extraData = {
      type: item.type,
      price: item.price,
      mapsUrl: item.mapsUrl,
      qrisUrl: '',
      whatsappNumber: item.whatsappNumber,
      addressNote: item.addressNote,
      latitude: item.latitude,
      longitude: item.longitude,
    };

    await prisma.food.create({
      data: {
        id: item.id,
        userId: item.userId,
        ownerName: item.ownerName,
        title: item.title,
        category: item.category,
        description: item.addressNote,
        quantity: item.quantity,
        unit: 'porsi',
        preparedAt: 'Hari ini',
        pickupDeadline: item.pickupDeadline,
        areaLabel: item.addressNote,
        storageNotes: JSON.stringify(extraData),
        allergens: JSON.stringify([]),
        status: 'AVAILABLE',
        requestCount: 0,
        images: { create: [{ path: item.image, sortOrder: 0 }] },
        pickupDetail: {
          create: {
            fullAddress: item.mapsUrl,
            landmark: item.addressNote,
            contactPhone: item.whatsappNumber,
          },
        },
      },
    });
  }

  // 4. Seed 2 Connected Demo Orders (Siti -> Hendra & Budi)
  await prisma.pickupRequest.create({
    data: {
      id: 'req-demo-hendra-1',
      foodId: 'food-hendra-gratis',
      foodTitle: 'Pastry Croissant Butter & Danishes',
      foodImage: items[0].image,
      foodCategory: 'roti_kue',
      requesterId: 'user-siti',
      requesterName: 'Siti Rahma',
      requesterPhone: '081234567803',
      message: 'Halo Hendra Bakery, saya ingin mengambil croissant gratisnya.',
      proposedPickupTime: 'Hari ini, 20:00 WIB',
      status: 'PENDING',
      activeFlag: 1,
    },
  });

  await prisma.pickupRequest.create({
    data: {
      id: 'req-demo-budi-1',
      foodId: 'food-budi-bayar',
      foodTitle: 'Paket Nasi Rames Komplit (Closing Sale)',
      foodImage: items[3].image,
      foodCategory: 'berbayar',
      requesterId: 'user-siti',
      requesterName: 'Siti Rahma',
      requesterPhone: '081234567803',
      message: 'Halo Pak Budi, saya pesan paket nasi rames closing sale ya.',
      proposedPickupTime: 'Hari ini, 21:30 WIB',
      status: 'PENDING',
      activeFlag: 1,
    },
  });

  console.log('✅ Seeding selesai! 3 akun demo, 6 produk, 2 pesanan terhubung.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
