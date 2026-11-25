import { prisma } from './prisma';
import { FoodItem, PickupRequest, ActivityLog, User } from '@/types';
import { resolveMapsCoordinates } from './geo';

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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatted.replace('.', ':')} WIB`;
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

// Queries using Prisma ORM with eager relation loading
export async function getAllData(preferredUserId?: string) {
  const [foodsRaw, requestsRaw, usersRaw, activitiesRaw, activeSetting] = await Promise.all([
    prisma.food.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        pickupDetail: true,
      },
    }),
    prisma.pickupRequest.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.user.findMany(),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.appSetting.findUnique({ where: { key: 'active_user_id' } }),
  ]);

  const foods = foodsRaw.map(mapFood);
  const requests = requestsRaw.map(mapRequest);
  const users = usersRaw.map(mapUser);
  const activities = activitiesRaw.map(mapActivity);

  const targetUserId = preferredUserId || activeSetting?.value || null;
  const currentUser = targetUserId ? users.find((u) => u.id === targetUserId) || null : null;

  return {
    user: currentUser,
    users,
    foods,
    requests,
    activities,
  };
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

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User | null> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.avatar ? { avatar: data.avatar } : {}),
    },
  });

  return mapUser(updated);
}

// PRISMA CRUD: Food with Normalized Relations
export async function createFoodDb(food: any): Promise<FoodItem> {
  const foodId = food.id || `food-${Date.now()}`;
  const userId = food.userId || 'user-budi';
  const ownerName = food.ownerName || 'Budi Santoso';

  // Ensure user exists
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        name: ownerName,
        email: `${userId}@sharefood.local`,
        roleBadge: 'Donatur Komunitas',
      },
    });
  }

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

  const created = await prisma.$transaction(async (tx) => {
    const f = await tx.food.create({
      data: {
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
      },
      include: {
        images: true,
        pickupDetail: true,
      },
    });

    await tx.activity.create({
      data: {
        id: `act-${Date.now()}`,
        userId: userId,
        type: 'posted',
        title: 'Postingan Baru Dibuat',
        description: `Anda membagikan ${f.title} (${f.quantity} ${f.unit})`,
        timestamp: 'Baru saja',
        status: 'AVAILABLE',
        targetUrl: `/dashboard/makanan-saya/${f.id}`,
      },
    });

    return f;
  });

  return mapFood(created);
}

export async function updateFoodDb(id: string, data: Partial<FoodItem>) {
  let resolvedFromNewMaps: { lat: number; lng: number } | null = null;
  if (data.mapsUrl !== undefined && data.latitude == null && data.longitude == null) {
    resolvedFromNewMaps = await resolveMapsCoordinates(data.mapsUrl);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.food.findUnique({
      where: { id },
      include: { pickupDetail: true },
    });

    let extra: any = {};
    if (existing?.storageNotes) {
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

    await tx.food.update({
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
      },
    });

    if (data.images && data.images.length > 0) {
      await tx.foodImage.deleteMany({ where: { foodId: id } });
      await tx.foodImage.createMany({
        data: data.images.map((path, idx) => ({
          foodId: id,
          path,
          sortOrder: idx,
        })),
      });
    }

    const landmarkVal = data.addressNote || data.pickupDetails?.landmark || existing?.pickupDetail?.landmark || '';
    const fullAddressVal = data.mapsUrl || data.pickupDetails?.fullAddress || existing?.pickupDetail?.fullAddress || '';
    const contactPhoneVal = data.whatsappNumber || data.pickupDetails?.contactPhone || existing?.pickupDetail?.contactPhone || '';

    await tx.pickupDetail.upsert({
      where: { foodId: id },
      create: {
        foodId: id,
        fullAddress: fullAddressVal,
        landmark: landmarkVal,
        contactPhone: contactPhoneVal,
      },
      update: {
        ...(landmarkVal ? { landmark: landmarkVal } : {}),
        ...(fullAddressVal ? { fullAddress: fullAddressVal } : {}),
        ...(contactPhoneVal ? { contactPhone: contactPhoneVal } : {}),
      },
    });

    return await tx.food.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        pickupDetail: true,
      },
    });
  });

  return updated ? mapFood(updated) : null;
}

export async function cancelFoodDb(id: string) {
  await prisma.$transaction([
    prisma.food.update({
      where: { id },
      data: { status: 'CANCELLED' },
    }),
    prisma.pickupRequest.updateMany({
      where: {
        foodId: id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      data: { status: 'CANCELLED' },
    }),
  ]);
}

export async function deleteFoodDb(id: string) {
  await prisma.food.delete({
    where: { id },
  });
}

// PRISMA CRUD: PickupRequest
export async function createRequestDb(req: PickupRequest) {
  // Prevent self-ordering (owner cannot order their own food)
  const targetFood = await prisma.food.findUnique({ where: { id: req.foodId } });
  if (targetFood && targetFood.userId === req.requesterId) {
    throw new Error('Anda tidak dapat memesan makanan milik Anda sendiri.');
  }

  // Prevent duplicate active requests (PENDING or APPROVED) by the same user for the same food
  const existingReq = await prisma.pickupRequest.findFirst({
    where: {
      foodId: req.foodId,
      requesterId: req.requesterId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });
  if (existingReq) {
    return mapRequest(existingReq);
  }

  // Ensure requester exists
  const existingUser = await prisma.user.findUnique({ where: { id: req.requesterId } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: req.requesterId,
        name: req.requesterName || 'Pemohon',
        email: `${req.requesterId}@sharefood.local`,
        roleBadge: 'Pengambil Makanan',
      },
    });
  }

  const created = await prisma.$transaction(async (tx) => {
    const r = await tx.pickupRequest.create({
      data: {
        id: req.id,
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
    });

    await tx.food.update({
      where: { id: req.foodId },
      data: { requestCount: { increment: 1 } },
    });

    return r;
  });

  return mapRequest(created);
}

export async function approveRequestDb(requestId: string) {
  return await prisma.$transaction(async (tx) => {
    const targetReq = await tx.pickupRequest.findUnique({ where: { id: requestId } });
    if (!targetReq) return false;

    const food = await tx.food.findUnique({ where: { id: targetReq.foodId } });

    // 1. Approve target request
    const nowFormatted = formatWaktuId();
    await tx.pickupRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', respondedAt: nowFormatted, activeFlag: 1 },
    });

    // 2. Only reserve food & auto-decline other requests if this was the last portion (quantity <= 1)
    if (food && food.quantity <= 1) {
      await tx.pickupRequest.updateMany({
        where: {
          foodId: targetReq.foodId,
          id: { not: requestId },
          status: 'PENDING',
        },
        data: { status: 'DECLINED', respondedAt: nowFormatted, activeFlag: null },
      });

      await tx.food.update({
        where: { id: targetReq.foodId },
        data: { status: 'RESERVED' },
      });
    }

    // 4. Log activity
    await tx.activity.create({
      data: {
        id: `act-${Date.now()}`,
        userId: targetReq.requesterId,
        type: 'approved',
        title: 'Permintaan Disetujui',
        description: `Anda menyetujui ${targetReq.requesterName} untuk ${targetReq.foodTitle || 'Makanan'}`,
        timestamp: 'Baru saja',
        status: 'APPROVED',
        targetUrl: `/dashboard/makanan-saya/${targetReq.foodId}`,
      },
    });

    return true;
  });
}

export async function declineRequestDb(requestId: string) {
  await prisma.pickupRequest.update({
    where: { id: requestId },
    data: { status: 'DECLINED', respondedAt: formatWaktuId(), activeFlag: null },
  });
  return true;
}

export async function cancelRequestDb(requestId: string) {
  return await prisma.$transaction(async (tx) => {
    const targetReq = await tx.pickupRequest.findUnique({ where: { id: requestId } });
    if (!targetReq) return false;

    if (targetReq.status === 'APPROVED') {
      await tx.food.update({
        where: { id: targetReq.foodId },
        data: { status: 'AVAILABLE' },
      });
    }

    await tx.pickupRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED', activeFlag: null },
    });

    return true;
  });
}

export async function markAsTakenDb(foodId: string, _currentUserId?: string, requestId?: string) {
  return await prisma.$transaction(async (tx) => {
    const food = await tx.food.findUnique({ where: { id: foodId } });
    const nowFormatted = formatWaktuId();

    const targetRequests = requestId
      ? await tx.pickupRequest.findMany({ where: { id: requestId, foodId, status: 'APPROVED' } })
      : await tx.pickupRequest.findMany({ where: { foodId, status: 'APPROVED' } });

    const decrementBy = Math.max(1, targetRequests.length);
    const currentQty = food?.quantity ?? 1;
    const newQty = Math.max(0, currentQty - decrementBy);

    await tx.food.update({
      where: { id: foodId },
      data: {
        quantity: newQty,
        status: newQty <= 0 ? 'TAKEN' : 'AVAILABLE',
      },
    });

    if (requestId) {
      await tx.pickupRequest.updateMany({
        where: { id: requestId, foodId, status: 'APPROVED' },
        data: { status: 'COMPLETED', respondedAt: nowFormatted, activeFlag: null },
      });
    } else {
      await tx.pickupRequest.updateMany({
        where: { foodId, status: 'APPROVED' },
        data: { status: 'COMPLETED', respondedAt: nowFormatted, activeFlag: null },
      });
    }

    if (food?.userId) {
      await tx.user.update({
        where: { id: food.userId },
        data: { sharedCount: { increment: decrementBy } },
      });
    }

    for (const r of targetRequests) {
      if (r.requesterId) {
        await tx.user.update({
          where: { id: r.requesterId },
          data: { receivedCount: { increment: 1 } },
        });
      }
    }

    await tx.activity.create({
      data: {
        id: `act-${Date.now()}`,
        userId: food?.userId || 'user-budi',
        type: 'taken',
        title: 'Penyerahan Selesai',
        description: 'Makanan berhasil diserahterimakan dan ditandai TAKEN',
        timestamp: 'Baru saja',
        status: 'COMPLETED',
        targetUrl: '/dashboard/riwayat',
      },
    });

    return true;
  });
}

export async function resetDatabase() {
  const { execSync } = await import('child_process');
  execSync('npx prisma db seed', {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  return true;
}
