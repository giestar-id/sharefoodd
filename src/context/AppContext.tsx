'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FoodItem, PickupRequest, ActivityLog, User } from '@/types';

export type UserRole = 'PENGAMBIL' | 'PEMOSTING';

interface AppContextType {
  user: User | null;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  switchRole: () => void;
  foods: FoodItem[];
  requests: PickupRequest[];
  activities: ActivityLog[];
  isLoaded: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  createFood: (foodData: Partial<FoodItem>) => Promise<FoodItem>;
  updateFood: (id: string, foodData: Partial<FoodItem>) => Promise<void>;
  cancelFood: (id: string) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  markAsTaken: (foodId: string, requestId?: string) => Promise<void>;
  requestFood: (foodId: string, message: string, proposedTime: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 100% Database-Driven: Zero Hardcoded Dummy Data!
  // All initial states start empty and are populated strictly from Prisma ORM via /api/data
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRoleState] = useState<UserRole>('PENGAMBIL');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastFetchAtRef = useRef<number>(0);
  const lastMutationAtRef = useRef<number>(0);

  // Sync role with localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('active_role') as UserRole;
    if (savedRole === 'PENGAMBIL' || savedRole === 'PEMOSTING') {
      setActiveRoleState(savedRole);
    }
  }, []);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem('active_role', role);
  };

  const switchRole = () => {
    const newRole = activeRole === 'PENGAMBIL' ? 'PEMOSTING' : 'PENGAMBIL';
    setActiveRole(newRole);
  };

  // Hydrate instant cached state from sessionStorage (stale-while-revalidate)
  useEffect(() => {
    try {
      const cachedRaw = sessionStorage.getItem('sharefood_cache_v1');
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && typeof cached === 'object') {
          if (cached.user) setUser(cached.user);
          if (Array.isArray(cached.foods)) setFoods(cached.foods);
          if (Array.isArray(cached.requests)) setRequests(cached.requests);
          if (Array.isArray(cached.activities)) setActivities(cached.activities);
        }
      }
    } catch {}
  }, []);

  // Fetch live records directly from PostgreSQL via Prisma ORM API (authenticated via HTTP-only session cookie)
  const refreshFromDb = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && (now - lastFetchAtRef.current < 10000 || now - lastMutationAtRef.current < 5000)) {
      return;
    }
    lastFetchAtRef.current = now;
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Skip overwriting state if a mutation happened while this fetch was in flight
        if (lastMutationAtRef.current > now) return;
        const nextUser = data.user || null;
        const nextFoods = Array.isArray(data.foods) ? data.foods : [];
        const nextRequests = Array.isArray(data.requests) ? data.requests : [];
        const nextActivities = Array.isArray(data.activities) ? data.activities : [];
        setUser(nextUser);
        setFoods(nextFoods);
        setRequests(nextRequests);
        setActivities(nextActivities);
        try {
          sessionStorage.setItem(
            'sharefood_cache_v1',
            JSON.stringify({
              user: nextUser,
              foods: nextFoods,
              requests: nextRequests,
              activities: nextActivities,
            })
          );
        } catch {}
      }
    } catch (e) {
      console.error('Failed to load data from Prisma ORM:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refreshFromDb(true);
    const handleFocus = () => {
      void refreshFromDb(false);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshFromDb]);

  // REAL LOGIN via Prisma ORM + HTTP-only Session Cookie
  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        void refreshFromDb(true);
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Email atau kata sandi salah.' };
    } catch (e: any) {
      console.error('Login error:', e);
      return { ok: false, error: e?.message || 'Gagal menghubungi server.' };
    }
  };

  // REAL REGISTER via Prisma ORM + HTTP-only Session Cookie
  const register = async (payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        void refreshFromDb(true);
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Gagal mendaftar akun.' };
    } catch (e: any) {
      console.error('Register error:', e);
      return { ok: false, error: e?.message || 'Gagal menghubungi server.' };
    }
  };

  // LOGOUT via Prisma ORM (Deletes DB Session + Clears Cookie)
  const logout = async () => {
    setUser(null);
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      await refreshFromDb();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // UPDATE PROFILE via Prisma ORM
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, data }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.user) setUser(resData.user);
      }
    } catch (e) {
      console.error('Update profile error:', e);
    }
  };

  // RESET TO DEFAULT SEED IN PRISMA DATABASE
  const resetToDefault = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      await refreshFromDb();
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  // CREATE (Food via Prisma ORM with Instant Optimistic UI)
  const createFood = async (foodData: Partial<FoodItem>): Promise<FoodItem> => {
    if (!user?.id) {
      throw new Error('Silakan masuk terlebih dahulu untuk memposting makanan.');
    }
    lastMutationAtRef.current = Date.now();
    const foodId = foodData.id || `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userId = user.id;
    const ownerName = user.name;
    const foodType = foodData.type || (foodData.category === 'berbayar' ? 'berbayar' : 'gratis');
    const images =
      foodData.images && foodData.images.length > 0
        ? foodData.images
        : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'];

    const optimisticFood: FoodItem = {
      id: foodId,
      userId,
      ownerName,
      title: foodData.title || 'Makanan Tanpa Judul',
      category: foodData.category || (foodType === 'berbayar' ? 'berbayar' : 'makanan_berat'),
      description: foodData.description || foodData.addressNote || '',
      quantity: Number(foodData.quantity) || 1,
      unit: foodData.unit || 'porsi',
      preparedAt: foodData.preparedAt || 'Baru saja',
      pickupDeadline: foodData.pickupDeadline || 'Hari ini, 21:00 WIB',
      areaLabel: foodData.addressNote || foodData.areaLabel || 'Tebet Barat, Jakarta Selatan',
      storageNotes: foodData.storageNotes || '',
      allergens: foodData.allergens || [],
      status: 'AVAILABLE',
      images,
      createdAt: new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' }),
      requestCount: 0,
      price: Number(foodData.price) || 0,
      type: foodType,
      mapsUrl: foodData.mapsUrl || foodData.pickupDetails?.fullAddress || '',
      qrisUrl: foodData.qrisUrl || '',
      whatsappNumber: foodData.whatsappNumber || foodData.pickupDetails?.contactPhone || user?.phone || '',
      addressNote: foodData.addressNote || foodData.pickupDetails?.landmark || '',
      latitude: typeof foodData.latitude === 'number' ? foodData.latitude : null,
      longitude: typeof foodData.longitude === 'number' ? foodData.longitude : null,
      pickupDetails: {
        foodId,
        fullAddress: foodData.mapsUrl || foodData.pickupDetails?.fullAddress || 'Jl. Tebet Barat Dalam IV No. 18, Jakarta Selatan',
        landmark: foodData.addressNote || foodData.pickupDetails?.landmark || 'Pagar hitam samping apotek',
        contactPhone: foodData.whatsappNumber || foodData.pickupDetails?.contactPhone || user?.phone || '0812-9876-5432',
      },
    };

    // Instant UI update
    setFoods((prev) => [optimisticFood, ...prev]);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'posted',
        title: 'Postingan Baru Dibuat',
        description: `Anda membagikan ${optimisticFood.title} (${optimisticFood.quantity} ${optimisticFood.unit})`,
        timestamp: 'Baru saja',
        status: 'AVAILABLE',
        targetUrl: `/dashboard/makanan-saya/${optimisticFood.id}`,
      },
      ...prev,
    ]);

    // Sync with database in background & reconcile resolved coordinates
    void fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimisticFood),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal menyimpan makanan. Silakan coba lagi.');
        const createdFood: FoodItem = await res.json();
        setFoods((prev) => prev.map((f) => (f.id === foodId ? createdFood : f)));
      })
      .catch((err) => {
        console.error('Failed to persist food in Prisma:', err);
        setFoods((prev) => prev.filter((f) => f.id !== foodId));
      });

    return optimisticFood;
  };

  // UPDATE (Food via Prisma ORM)
  const updateFood = async (id: string, foodData: Partial<FoodItem>) => {
    lastMutationAtRef.current = Date.now();
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            ...foodData,
            pickupDetails: {
              ...f.pickupDetails,
              ...(foodData.pickupDetails || {}),
              foodId: id,
            },
          };
        }
        return f;
      })
    );

    void fetch(`/api/foods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(foodData),
    }).catch((e) => console.error('Failed to update food in Prisma:', e));
  };

  // DELETE / CANCEL (Soft Delete via Prisma ORM)
  const cancelFood = async (id: string) => {
    lastMutationAtRef.current = Date.now();
    setFoods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'CANCELLED' } : f))
    );
    setRequests((prev) =>
      prev.map((r) =>
        r.foodId === id && (r.status === 'PENDING' || r.status === 'APPROVED')
          ? { ...r, status: 'CANCELLED' }
          : r
      )
    );

    void fetch(`/api/foods/${id}/cancel`, { method: 'POST' }).catch((e) =>
      console.error('Failed to cancel food in Prisma:', e)
    );
  };

  // HARD DELETE via Prisma ORM
  const deleteFood = async (id: string) => {
    lastMutationAtRef.current = Date.now();
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setRequests((prev) => prev.filter((r) => r.foodId !== id));

    void fetch(`/api/foods/${id}`, { method: 'DELETE' }).catch((e) =>
      console.error('Failed to delete food in Prisma:', e)
    );
  };

  // APPROVE REQUEST via Prisma ORM (Instant Optimistic UI)
  const approveRequest = async (requestId: string) => {
    lastMutationAtRef.current = Date.now();
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nowFormatted = `${new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':')} WIB`;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              respondedAt: nowFormatted,
            }
          : r
      )
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'approved',
        title: 'Permintaan Disetujui',
        description: `Anda menyetujui ${targetReq.requesterName} untuk ${
          targetReq.foodTitle || 'Makanan'
        }`,
        timestamp: 'Baru saja',
        status: 'APPROVED',
        targetUrl: `/dashboard/makanan-saya/${targetReq.foodId}`,
      },
      ...prev,
    ]);

    void fetch(`/api/requests/${requestId}/approve`, { method: 'POST' }).catch((e) =>
      console.error('Failed to approve request in Prisma:', e)
    );
  };

  // DECLINE REQUEST via Prisma ORM
  const declineRequest = async (requestId: string) => {
    lastMutationAtRef.current = Date.now();
    const nowFormatted = `${new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':')} WIB`;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'DECLINED', respondedAt: nowFormatted }
          : r
      )
    );

    void fetch(`/api/requests/${requestId}/decline`, { method: 'POST' }).catch((e) =>
      console.error('Failed to decline request in Prisma:', e)
    );
  };

  // CANCEL REQUEST via Prisma ORM
  const cancelRequest = async (requestId: string) => {
    lastMutationAtRef.current = Date.now();
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
    );

    void fetch(`/api/requests/${requestId}/cancel`, { method: 'POST' }).catch((e) =>
      console.error('Failed to cancel request in Prisma:', e)
    );
  };

  // MARK AS TAKEN via Prisma ORM (Instant Optimistic UI — keeps food active until seller sets stock to 0)
  const markAsTaken = async (foodId: string, requestId?: string) => {
    lastMutationAtRef.current = Date.now();
    const matchingApproved = requests.filter(
      (r) =>
        r.foodId === foodId &&
        r.status === 'APPROVED' &&
        (!requestId || r.id === requestId)
    ).length;
    const completedCount = Math.max(1, matchingApproved);

    const nowFormatted = `${new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':')} WIB`;

    setRequests((prev) =>
      prev.map((r) =>
        r.foodId === foodId &&
        r.status === 'APPROVED' &&
        (!requestId || r.id === requestId)
          ? { ...r, status: 'COMPLETED', respondedAt: nowFormatted }
          : r
      )
    );

    if (user) {
      setUser({
        ...user,
        sharedCount: (user.sharedCount || 0) + completedCount,
      });
    }

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'taken',
        title: 'Penyerahan Selesai',
        description: `Makanan berhasil diserahterimakan`,
        timestamp: 'Baru saja',
        status: 'COMPLETED',
        targetUrl: '/dashboard/riwayat',
      },
      ...prev,
    ]);

    void fetch(`/api/foods/${foodId}/taken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, requestId }),
    }).catch((e) => console.error('Failed to mark food as taken in Prisma:', e));
  };

  // CREATE PICKUP REQUEST via Prisma ORM (Instant Optimistic UI)
  const requestFood = async (
    foodId: string,
    message: string,
    proposedTime: string
  ) => {
    if (!user?.id) {
      throw new Error('Silakan masuk terlebih dahulu untuk memesan makanan.');
    }
    lastMutationAtRef.current = Date.now();
    const targetFood = foods.find((f) => f.id === foodId);
    if (!targetFood) return;
    if (targetFood.userId === user.id) {
      throw new Error('Anda tidak dapat memesan makanan milik Anda sendiri.');
    }

    const requesterId = user.id;
    const existingActive = requests.find(
      (r) =>
        r.foodId === foodId &&
        r.requesterId === requesterId &&
        (r.status === 'PENDING' || r.status === 'APPROVED')
    );
    if (existingActive) {
      return;
    }

    const todayWibPrefix = new Date().toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const isTargetFree = targetFood.type !== 'berbayar' && targetFood.category !== 'berbayar';
    if (isTargetFree) {
      const todayFreeCount = requests.filter((r) => {
        if (r.requesterId !== requesterId) return false;
        if (r.status !== 'PENDING' && r.status !== 'APPROVED' && r.status !== 'COMPLETED') return false;
        if (!r.createdAt || !r.createdAt.includes(todayWibPrefix)) return false;
        const parent = foods.find((f) => f.id === r.foodId);
        const isPaid = parent
          ? parent.type === 'berbayar' || parent.category === 'berbayar'
          : r.foodCategory === 'berbayar';
        return !isPaid;
      }).length;

      if (todayFreeCount >= 3) {
        throw new Error(
          'Batas ambil makanan gratis hari ini sudah habis (maksimal 3 per hari). Anda bisa mengambil lagi besok!'
        );
      }
    }

    const nowFormatted = `${new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':')} WIB`;

    const optimisticReq: PickupRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodId: targetFood.id,
      foodTitle: targetFood.title,
      foodImage: targetFood.images[0],
      foodCategory: targetFood.category,
      requesterId,
      requesterName: user.name,
      requesterAvatar: user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      message: message || 'Halo, saya ingin mengambil makanan ini.',
      proposedPickupTime: proposedTime || 'Hari ini, 19:00 WIB',
      status: 'PENDING',
      createdAt: nowFormatted,
    };

    // Instant UI update
    setRequests((prev) => [optimisticReq, ...prev]);
    setFoods((prev) =>
      prev.map((f) =>
        f.id === foodId ? { ...f, requestCount: (f.requestCount || 0) + 1 } : f
      )
    );

    // Sync with database in background
    void fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimisticReq),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal membuat pesanan');
        const createdReq: PickupRequest = await res.json();
        setRequests((prev) =>
          prev.map((r) => (r.id === optimisticReq.id ? createdReq : r))
        );
      })
      .catch((e) => {
        console.error('Failed to create request in Prisma:', e);
        setRequests((prev) => prev.filter((r) => r.id !== optimisticReq.id));
        setFoods((prev) =>
          prev.map((f) =>
            f.id === foodId ? { ...f, requestCount: Math.max(0, (f.requestCount || 1) - 1) } : f
          )
        );
      });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        switchRole,
        foods,
        requests,
        activities,
        isLoaded,
        login,
        register,
        logout,
        updateProfile,
        createFood,
        updateFood,
        cancelFood,
        deleteFood,
        approveRequest,
        declineRequest,
        cancelRequest,
        markAsTaken,
        requestFood,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
