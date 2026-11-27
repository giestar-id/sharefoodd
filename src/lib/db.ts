import { prisma } from './prisma';
import { FoodItem, PickupRequest, ActivityLog, User } from '@/types';
import { resolveMapsCoordinates, geocodeAddress } from './geo';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  SESSION_TTL_MS,
} from './auth';

// Data Mappers from Prisma relational models to frontend types
function mapFood(f: any): FoodItem {
  let images: string[] = [];
  if (Array.isArray(f.images) && f.images.length > 0) {
    images = f.images.map((img: any) => (typeof img === 'string' ? img : img.path));
  } else if (typeof f.images === 'string') {
    try {
      const parsed = JSON.parse(f.images);
      images = Array.isArray(parsed) ? parsed : [];
    } catch {
      images = [];
    }
  }

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'];
  }

  let extra: any = {};
  try {
    if (f.storageNotes && f.storageNotes.startsWith('{')) {
      extra = JSON.parse(f.storageNotes);
    }
  } catch (e) {}

  const foodType = extra.type || (f.category === 'berbayar' ? 'berbayar' : 'gratis');
  const foodPrice = typeof extra.price === 'number' ? extra.price : (foodType === 'berbayar' ? 15000 : 0);
  const mapsUrl = extra.mapsUrl || f.pickupDetail?.fullAddress || '';
  const qrisUrl = extra.qrisUrl || '';
  const whatsappNumber = extra.whatsappNumber || f.pickupDetail?.contactPhone || '0812-3456-7890';
  const addressNote = extra.addressNote || f.pickupDetail?.landmark || f.areaLabel || '';
  const latitude = typeof extra.latitude === 'number' ? extra.latitude : null;
  const longitude = typeof extra.longitude === 'number' ? extra.longitude : null;

  return {
    id: f.id,
    userId: f.userId,
    ownerName: f.ownerName,
    title: f.title,
    category: f.category,
    description: f.description || '',
    quantity: f.quantity,
    unit: f.unit,
    preparedAt: f.preparedAt || 'Hari ini',
    pickupDeadline: f.pickupDeadline,
    areaLabel: f.areaLabel,
    storageNotes: f.storageNotes || '',
    allergens: typeof f.allergens === 'string' ? JSON.parse(f.allergens) : f.allergens || [],
    status: f.status as any,
    images: images,
    createdAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Hari ini',
    requestCount: f.requestCount || 0,
    price: foodPrice,
    type: foodType,
    mapsUrl: mapsUrl,
    qrisUrl: qrisUrl,
    whatsappNumber: whatsappNumber,
    addressNote: addressNote,
    latitude: latitude,
    longitude: longitude,
    pickupDetails: {
      foodId: f.id,
      fullAddress: f.pickupDetail?.fullAddress || mapsUrl || 'Lokasi penjemputan tersedia setelah disetujui',
      landmark: f.pickupDetail?.landmark || addressNote || 'Patokan lokasi',
      contactPhone: f.pickupDetail?.contactPhone || whatsappNumber || '0812-3456-7890',
    },
  };
}

function formatWaktuId(date: Date = new Date()): string {
  const formatted = date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatted.replace('.', ':')} WIB`;
}

function getStartOfTodayWib(): Date {
  const now = new Date();
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibNow = new Date(now.getTime() + wibOffsetMs);
  const startOfWibDayUtcMs =
    Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth(), wibNow.getUTCDate()) - wibOffsetMs;
  return new Date(startOfWibDayUtcMs);
}

function isFoodPaid(food: { category?: string | null; storageNotes?: string | null }): boolean {
  if (food.category === 'berbayar') return true;
  if (food.storageNotes && food.storageNotes.startsWith('{')) {
    try {
      const extra = JSON.parse(food.storageNotes);
      if (extra?.type === 'berbayar') return true;
    } catch {}
  }
  return false;
}

function mapRequest(r: any): PickupRequest {
  const formattedCreatedAt = r.createdAt
    ? formatWaktuId(new Date(r.createdAt))
    : formatWaktuId();
  const formattedRespondedAt =
    r.respondedAt && r.respondedAt !== 'Baru saja'
      ? r.respondedAt
      : r.updatedAt
      ? formatWaktuId(new Date(r.updatedAt))
      : undefined;

  return {
    id: r.id,
    foodId: r.foodId,
    foodTitle: r.foodTitle,
    foodImage: r.foodImage,
    foodCategory: r.foodCategory,
    requesterId: r.requesterId,
    requesterName: r.requesterName,
    requesterAvatar: r.requesterAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    requesterStats: r.requesterStats,
    message: r.message || '',
    proposedPickupTime: r.proposedPickupTime,
    status: r.status as any,
    createdAt: formattedCreatedAt,
    respondedAt: formattedRespondedAt,
  };
}

function mapUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    roleBadge: u.roleBadge,
    joinedDate: u.joinedDate,
    sharedCount: u.sharedCount,
    receivedCount: u.receivedCount,
  };
}

function mapActivity(a: any): ActivityLog {
  return {
    id: a.id,
    type: a.type as any,
    title: a.title,
    description: a.description,
    timestamp: a.timestamp,
    status: a.status,
    targetUrl: a.targetUrl || '',
  };
}

// Queries using Prisma ORM with parallel single-round-trip loading
export async function getAllDataByToken(sessionToken: string | null = null) {
  const [sessionRaw, foodsRaw, requestsRaw, activitiesRaw] = await Promise.all([
    sessionToken
      ? prisma.session.findUnique({
          where: { token: sessionToken },
          include: { user: true },
        })
      : Promise.resolve(null),
    prisma.food.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        pickupDetail: true,
      },
    }),
    prisma.pickupRequest.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  let currentUser: User | null = null;
  if (sessionRaw) {
    if (sessionRaw.expiresAt < new Date()) {
      void prisma.session.delete({ where: { id: sessionRaw.id } }).catch(() => {});
    } else if (sessionRaw.user) {
      currentUser = mapUser(sessionRaw.user);
    }
  }

  return {
    user: currentUser,
    foods: foodsRaw.map(mapFood),
    requests: requestsRaw.map(mapRequest),
    activities: activitiesRaw.map(mapActivity),
  };
}

export async function getAllData(sessionUserId: string | null = null) {
  const [userRaw, foodsRaw, requestsRaw, activitiesRaw] = await Promise.all([
    sessionUserId ? prisma.user.findUnique({ where: { id: sessionUserId } }) : Promise.resolve(null),
    prisma.food.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        pickupDetail: true,
      },
    }),
    prisma.pickupRequest.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  return {
    user: userRaw ? mapUser(userRaw) : null,
    foods: foodsRaw.map(mapFood),
    requests: requestsRaw.map(mapRequest),
    activities: activitiesRaw.map(mapActivity),
  };
}

// REAL AUTH: Register User + Credentials Account + Session
export async function registerUserDb(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ user: User; sessionToken: string } | { error: string }> {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Email sudah terdaftar! Silakan masuk menggunakan akun Anda.' };
  }

  const passwordHash = hashPassword(input.password);
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const userId = `user-${Date.now()}`;

  const createdUser = await prisma.user.create({
    data: {
      id: userId,
      name: input.name.trim(),
      email,
      phone: input.phone || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      roleBadge: 'Warga Terverifikasi',
      joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      sharedCount: 0,
      receivedCount: 0,
      accounts: {
        create: {
          providerId: 'credentials',
          accountId: email,
          password: passwordHash,
        },
      },
      sessions: {
        create: {
          token: sessionToken,
          expiresAt,
        },
      },
    },
  });

  return { user: mapUser(createdUser), sessionToken };
}

// REAL AUTH: Login with Email & Password Verification + Session
export async function authenticateUserDb(
  emailRaw: string,
  password: string
): Promise<{ user: User; sessionToken: string } | { error: string }> {
  const email = emailRaw.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    return { error: 'Email belum terdaftar! Silakan daftar akun terlebih dahulu.' };
  }

  const credAccount = user.accounts.find((a) => a.providerId === 'credentials');
  if (!credAccount || !credAccount.password || !verifyPassword(password, credAccount.password)) {
    return { error: 'Kata sandi salah! Silakan periksa kembali.' };
  }

  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: sessionToken,
      expiresAt,
    },
  });

  return { user: mapUser(user), sessionToken };
}

export async function getUserBySessionTokenDb(token: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }
  return mapUser(session.user);
}

export async function deleteSessionDb(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getFoodById(id: string): Promise<FoodItem | null> {
  const f = await prisma.food.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      pickupDetail: true,
    },
  });

  return f ? mapFood(f) : null;
}

export async function setActiveUser(emailOrId: string): Promise<User | null> {
  const clean = emailOrId.toLowerCase().trim();
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: clean },
        { id: emailOrId },
      ],
    },
  });

  if (!user) {
    const namePart = clean.split('@')[0] || 'Pengguna';
    const formattedName = namePart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const newId = `user-${Date.now()}`;
    user = await prisma.user.create({
      data: {
        id: newId,
        name: formattedName,
        email: clean,
        phone: '0812-3456-7890',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        roleBadge: 'Warga Terverifikasi',
        joinedDate: 'November 2026',
        sharedCount: 0,
        receivedCount: 0,
      },
    });
  }

  await prisma.appSetting.upsert({
    where: { key: 'active_user_id' },
    update: { value: user.id },
    create: { key: 'active_user_id', value: user.id },
  });

  return mapUser(user);
}

export async function clearActiveUser() {
  await prisma.appSetting.deleteMany({
    where: { key: 'active_user_id' },
  });
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User | null> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.avatar ? { avatar: data.avatar } : {}),
    },
  });

  // Sync denormalized name fields across Food & PickupRequest relations
  if (data.name) {
    await Promise.all([
      prisma.food.updateMany({ where: { userId }, data: { ownerName: data.name } }),
      prisma.pickupRequest.updateMany({ where: { requesterId: userId }, data: { requesterName: data.name } }),
    ]);
  }

  return mapUser(updated);
}

// PRISMA CRUD: Food with Normalized Relations (Single Parallel Round-Trip)
export async function createFoodDb(food: any): Promise<FoodItem> {
  const foodId = food.id || genId('food');
  const userId = food.userId;
  if (!userId) {
    throw new Error('Pengguna harus masuk terlebih dahulu untuk memposting makanan.');
  }
  const ownerName = food.ownerName || 'Pengguna ShareFood';

  const imagesList: string[] = food.images && food.images.length > 0
    ? food.images
    : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'];

  const rawMapsUrl = food.mapsUrl || food.pickupDetails?.fullAddress || '';
  let resolvedLat: number | null = typeof food.latitude === 'number' ? food.latitude : null;
  let resolvedLng: number | null = typeof food.longitude === 'number' ? food.longitude : null;

  if ((resolvedLat === null || resolvedLng === null) && rawMapsUrl) {
    const coords = await resolveMapsCoordinates(rawMapsUrl);
    if (coords) {
      resolvedLat = coords.lat;
      resolvedLng = coords.lng;
    }
  }

  // Fallback: geocode patokan / areaLabel if Maps short-link did not expose raw coordinates
  if (resolvedLat === null || resolvedLng === null) {
    const fallbackQuery = food.addressNote || food.pickupDetails?.landmark || food.areaLabel || '';
    if (fallbackQuery) {
      const geo = await geocodeAddress(fallbackQuery);
      if (geo) {
        resolvedLat = geo.lat;
        resolvedLng = geo.lng;
      }
    }
  }

  const extraData = {
    type: food.type || (food.category === 'berbayar' ? 'berbayar' : 'gratis'),
    price: Number(food.price) || 0,
    mapsUrl: rawMapsUrl,
    qrisUrl: food.qrisUrl || '',
    whatsappNumber: food.whatsappNumber || food.pickupDetails?.contactPhone || '',
    addressNote: food.addressNote || food.pickupDetails?.landmark || food.areaLabel || '',
    latitude: resolvedLat,
    longitude: resolvedLng,
  };

  const foodCreateData = {
    id: foodId,
    userId: userId,
    ownerName: ownerName,
    title: food.title || 'Makanan Tanpa Judul',
    category: food.category || (extraData.type === 'berbayar' ? 'berbayar' : 'makanan_berat'),
    description: food.description || extraData.addressNote || '',
    quantity: Number(food.quantity) || 1,
    unit: food.unit || 'porsi',
    preparedAt: food.preparedAt || 'Baru saja',
    pickupDeadline: food.pickupDeadline || 'Hari ini, 21:00 WIB',
    areaLabel: extraData.addressNote || food.areaLabel || 'Tebet Barat, Jakarta Selatan',
    storageNotes: JSON.stringify(extraData),
    allergens: JSON.stringify(food.allergens || []),
    status: food.status || 'AVAILABLE',
    requestCount: 0,
    images: {
      create: imagesList.map((imgUrl, idx) => ({
        path: imgUrl,
        sortOrder: idx,
      })),
    },
    pickupDetail: {
      create: {
        fullAddress: extraData.mapsUrl || food.pickupDetails?.fullAddress || 'Jl. Tebet Barat Dalam IV No. 18, Jakarta Selatan',
        landmark: extraData.addressNote || food.pickupDetails?.landmark || 'Pagar hitam samping apotek',
        contactPhone: extraData.whatsappNumber || food.pickupDetails?.contactPhone || '0812-9876-5432',
      },
    },
  };

  const createFoodAndActivity = () =>
    Promise.all([
      prisma.food.create({
        data: foodCreateData,
        include: { images: true, pickupDetail: true },
      }),
      prisma.activity.create({
        data: {
          id: genId('act'),
          userId: userId,
          type: 'posted',
          title: 'Postingan Baru Dibuat',
          description: `Anda membagikan ${foodCreateData.title} (${foodCreateData.quantity} ${foodCreateData.unit})`,
          timestamp: 'Baru saja',
          status: 'AVAILABLE',
          targetUrl: `/dashboard/makanan-saya/${foodId}`,
        },
      }),
    ]);

  try {
    const [created] = await createFoodAndActivity();
    return mapFood(created);
  } catch (err: any) {
    // Fallback only if userId does not exist yet (FK violation P2003)
    if (err?.code === 'P2003') {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: ownerName,
          email: `${userId}@sharefood.local`,
          roleBadge: 'Donatur Komunitas',
        },
      });
      const [created] = await createFoodAndActivity();
      return mapFood(created);
    }
    throw err;
  }
}

export async function updateFoodDb(id: string, data: Partial<FoodItem>) {
  const [resolvedFromNewMaps, existing] = await Promise.all([
    data.mapsUrl !== undefined && data.latitude == null && data.longitude == null
      ? resolveMapsCoordinates(data.mapsUrl)
      : Promise.resolve(null),
    prisma.food.findUnique({
      where: { id },
      select: { storageNotes: true, pickupDetail: true },
    }),
  ]);

  if (!existing) {
    return null;
  }

  let extra: any = {};
  if (existing.storageNotes) {
    try {
      extra = JSON.parse(existing.storageNotes);
    } catch {
      extra = {};
    }
  }

  if (data.type !== undefined) extra.type = data.type;
  if (data.price !== undefined) extra.price = Number(data.price) || 0;
  if (data.mapsUrl !== undefined) extra.mapsUrl = data.mapsUrl;
  if (data.qrisUrl !== undefined) extra.qrisUrl = data.qrisUrl;
  if (data.whatsappNumber !== undefined) extra.whatsappNumber = data.whatsappNumber;
  if (data.addressNote !== undefined) extra.addressNote = data.addressNote;
  if (typeof data.latitude === 'number') extra.latitude = data.latitude;
  if (typeof data.longitude === 'number') extra.longitude = data.longitude;
  if (resolvedFromNewMaps) {
    extra.latitude = resolvedFromNewMaps.lat;
    extra.longitude = resolvedFromNewMaps.lng;
  }

  const hasPickupDetailUpdate =
    data.addressNote !== undefined ||
    data.mapsUrl !== undefined ||
    data.whatsappNumber !== undefined ||
    data.pickupDetails !== undefined;

  const landmarkVal = data.addressNote || data.pickupDetails?.landmark || existing?.pickupDetail?.landmark || '';
  const fullAddressVal = data.mapsUrl || data.pickupDetails?.fullAddress || existing?.pickupDetail?.fullAddress || '';
  const contactPhoneVal = data.whatsappNumber || data.pickupDetails?.contactPhone || existing?.pickupDetail?.contactPhone || '';

  const [updated] = await Promise.all([
    prisma.food.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.unit ? { unit: data.unit } : {}),
        ...(data.pickupDeadline ? { pickupDeadline: data.pickupDeadline } : {}),
        ...(data.areaLabel ? { areaLabel: data.areaLabel } : {}),
        storageNotes: JSON.stringify(extra),
        ...(data.allergens ? { allergens: JSON.stringify(data.allergens) } : {}),
        ...(data.images && data.images.length > 0
          ? {
              images: {
                deleteMany: {},
                create: data.images.map((path, idx) => ({ path, sortOrder: idx })),
              },
            }
          : {}),
        ...(hasPickupDetailUpdate
          ? {
              pickupDetail: {
                upsert: {
                  create: {
                    fullAddress: fullAddressVal,
                    landmark: landmarkVal,
                    contactPhone: contactPhoneVal,
                  },
                  update: {
                    ...(landmarkVal ? { landmark: landmarkVal } : {}),
                    ...(fullAddressVal ? { fullAddress: fullAddressVal } : {}),
                    ...(contactPhoneVal ? { contactPhone: contactPhoneVal } : {}),
                  },
                },
              },
            }
          : {}),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        pickupDetail: true,
      },
    }),
    // Keep denormalized foodTitle on PickupRequest in sync when menu title changes
    ...(data.title
      ? [prisma.pickupRequest.updateMany({ where: { foodId: id }, data: { foodTitle: data.title } })]
      : []),
  ]);

  return updated ? mapFood(updated) : null;
}

export async function cancelFoodDb(id: string) {
  await Promise.all([
    prisma.food.updateMany({
      where: { id },
      data: { status: 'CANCELLED' },
    }),
    prisma.pickupRequest.updateMany({
      where: {
        foodId: id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      data: { status: 'CANCELLED', activeFlag: null },
    }),
  ]);
}

export async function deleteFoodDb(id: string) {
  await prisma.food.deleteMany({
    where: { id },
  });
}

// PRISMA CRUD: PickupRequest (2 Parallel Round-Trips instead of 7 Sequential)
export async function createRequestDb(req: PickupRequest) {
  if (!req.requesterId) {
    throw new Error('Pengguna harus masuk terlebih dahulu untuk memesan makanan.');
  }

  const [targetFood, existingReq, todayRequests] = await Promise.all([
    prisma.food.findUnique({
      where: { id: req.foodId },
      select: { userId: true, status: true, quantity: true, category: true, storageNotes: true },
    }),
    prisma.pickupRequest.findFirst({
      where: {
        foodId: req.foodId,
        requesterId: req.requesterId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    }),
    prisma.pickupRequest.findMany({
      where: {
        requesterId: req.requesterId,
        status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] },
        createdAt: { gte: getStartOfTodayWib() },
      },
      select: {
        foodCategory: true,
        food: { select: { category: true, storageNotes: true } },
      },
    }),
  ]);

  if (!targetFood) {
    throw new Error('Makanan tidak ditemukan atau sudah dihapus.');
  }
  if (targetFood.userId === req.requesterId) {
    throw new Error('Anda tidak dapat memesan makanan milik Anda sendiri.');
  }
  if (targetFood.status !== 'AVAILABLE' || targetFood.quantity <= 0) {
    throw new Error('Makanan ini sudah habis atau tidak tersedia.');
  }

  if (existingReq) {
    return mapRequest(existingReq);
  }

  // Daily limit: max 3 FREE food requests per day (WIB); paid food is unlimited
  if (!isFoodPaid(targetFood)) {
    const todayFreeCount = todayRequests.filter((r) => {
      if (r.food) return !isFoodPaid(r.food);
      return r.foodCategory !== 'berbayar';
    }).length;

    if (todayFreeCount >= 3) {
      throw new Error(
        'Batas ambil makanan gratis hari ini sudah habis (maksimal 3 per hari). Anda bisa mengambil lagi besok!'
      );
    }
  }

  const reqId = req.id || genId('req');
  const createReqAndBump = () =>
    Promise.all([
      prisma.pickupRequest.create({
        data: {
          id: reqId,
          foodId: req.foodId,
          foodTitle: req.foodTitle,
          foodImage: req.foodImage,
          foodCategory: req.foodCategory,
          requesterId: req.requesterId,
          requesterName: req.requesterName,
          requesterPhone: (req as any).requesterPhone || '0812-3456-7890',
          requesterAvatar: req.requesterAvatar,
          requesterStats: req.requesterStats,
          message: req.message,
          proposedPickupTime: req.proposedPickupTime,
          status: req.status,
          activeFlag: ['PENDING', 'APPROVED'].includes(req.status) ? 1 : null,
        },
      }),
      prisma.food.update({
        where: { id: req.foodId },
        data: { requestCount: { increment: 1 } },
      }),
    ]);

  try {
    const [created] = await createReqAndBump();
    return mapRequest(created);
  } catch (err: any) {
    if (err?.code === 'P2003') {
      await prisma.user.upsert({
        where: { id: req.requesterId },
        update: {},
        create: {
          id: req.requesterId,
          name: req.requesterName || 'Pemohon',
          email: `${req.requesterId}@sharefood.local`,
          roleBadge: 'Pengambil Makanan',
        },
      });
      const [created] = await createReqAndBump();
      return mapRequest(created);
    }
    throw err;
  }
}

export async function approveRequestDb(requestId: string) {
  const nowFormatted = formatWaktuId();
  try {
    const targetReq = await prisma.pickupRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', respondedAt: nowFormatted, activeFlag: 1 },
      include: { food: { select: { userId: true } } },
    });

    const actorUserId = targetReq.food?.userId || targetReq.requesterId;
    await prisma.activity.create({
      data: {
        id: genId('act'),
        userId: actorUserId,
        type: 'approved',
        title: 'Permintaan Disetujui',
        description: `Anda menyetujui ${targetReq.requesterName} untuk ${targetReq.foodTitle || 'Makanan'}`,
        timestamp: 'Baru saja',
        status: 'APPROVED',
        targetUrl: `/dashboard/makanan-saya/${targetReq.foodId}`,
      },
    });

    return true;
  } catch (err: any) {
    if (err?.code === 'P2025') return false;
    throw err;
  }
}

export async function declineRequestDb(requestId: string) {
  try {
    await prisma.pickupRequest.update({
      where: { id: requestId },
      data: { status: 'DECLINED', respondedAt: formatWaktuId(), activeFlag: null },
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'P2025') return false;
    throw err;
  }
}

export async function cancelRequestDb(requestId: string) {
  try {
    await prisma.pickupRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED', activeFlag: null },
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'P2025') return false;
    throw err;
  }
}

export async function markAsTakenDb(foodId: string, _currentUserId?: string, requestId?: string) {
  const nowFormatted = formatWaktuId();

  const [food, targetRequests] = await Promise.all([
    prisma.food.findUnique({ where: { id: foodId }, select: { userId: true } }),
    prisma.pickupRequest.findMany({
      where: requestId ? { id: requestId, foodId, status: 'APPROVED' } : { foodId, status: 'APPROVED' },
      select: { id: true, requesterId: true },
    }),
  ]);

  if (targetRequests.length === 0) {
    return false;
  }

  const completedCount = targetRequests.length;
  const ops: Promise<any>[] = [
    prisma.pickupRequest.updateMany({
      where: requestId ? { id: requestId, foodId, status: 'APPROVED' } : { foodId, status: 'APPROVED' },
      data: { status: 'COMPLETED', respondedAt: nowFormatted, activeFlag: null },
    }),
  ];

  if (food?.userId) {
    ops.push(
      prisma.user.update({
        where: { id: food.userId },
        data: { sharedCount: { increment: completedCount } },
      }),
      prisma.activity.create({
        data: {
          id: genId('act'),
          userId: food.userId,
          type: 'taken',
          title: 'Penyerahan Selesai',
          description: 'Makanan berhasil diserahterimakan dan ditandai TAKEN',
          timestamp: 'Baru saja',
          status: 'COMPLETED',
          targetUrl: '/dashboard/riwayat',
        },
      })
    );
  }

  // Group increments per requesterId to avoid duplicate concurrent updates on the same User row
  const requesterCounts = new Map<string, number>();
  for (const r of targetRequests) {
    if (r.requesterId) {
      requesterCounts.set(r.requesterId, (requesterCounts.get(r.requesterId) || 0) + 1);
    }
  }
  for (const [reqUserId, count] of requesterCounts.entries()) {
    ops.push(
      prisma.user.update({
        where: { id: reqUserId },
        data: { receivedCount: { increment: count } },
      })
    );
  }

  await Promise.all(ops);
  return true;
}

export async function resetDatabase() {
  const { execSync } = await import('child_process');
  execSync('npx prisma db seed', {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  return true;
}
