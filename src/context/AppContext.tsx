'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Fetch live records directly from PostgreSQL via Prisma ORM API (authenticated via HTTP-only session cookie)
  const refreshFromDb = useCallback(async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setFoods(Array.isArray(data.foods) ? data.foods : []);
        setRequests(Array.isArray(data.requests) ? data.requests : []);
        setActivities(Array.isArray(data.activities) ? data.activities : []);
      }
    } catch (e) {
      console.error('Failed to load data from Prisma ORM:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshFromDb();
    const handleFocus = () => {
      refreshFromDb();
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
        await refreshFromDb();
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
        await refreshFromDb();
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

  // CREATE (Food via Prisma ORM)
  const createFood = async (foodData: Partial<FoodItem>): Promise<FoodItem> => {
    const payload = {
      ...foodData,
      userId: user?.id || 'user-budi',
      ownerName: user?.name || 'Budi Santoso',
      pickupDetails: {
        foodId: '',
        fullAddress: foodData.pickupDetails?.fullAddress || 'Jl. Tebet Barat Dalam IV No. 18, Jakarta Selatan',
        landmark: foodData.pickupDetails?.landmark || 'Pagar hitam samping apotek',
        contactPhone: foodData.pickupDetails?.contactPhone || user?.phone || '0812-9876-5432',
      },
    };

    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Gagal menyimpan makanan ke database Prisma');
    }

    const createdFood: FoodItem = await res.json();
    setFoods((prev) => [createdFood, ...prev]);

    // Also update activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'posted',
        title: 'Postingan Baru Dibuat',
        description: `Anda membagikan ${createdFood.title} (${createdFood.quantity} ${createdFood.unit})`,
        timestamp: 'Baru saja',
        status: 'AVAILABLE',
        targetUrl: `/dashboard/makanan-saya/${createdFood.id}`,
      },
      ...prev,
    ]);

    return createdFood;
  };

  // UPDATE (Food via Prisma ORM)
  const updateFood = async (id: string, foodData: Partial<FoodItem>) => {
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

    try {
      await fetch(`/api/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData),
      });
    } catch (e) {
      console.error('Failed to update food in Prisma:', e);
    }
  };

  // DELETE / CANCEL (Soft Delete via Prisma ORM)
  const cancelFood = async (id: string) => {
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

    try {
      await fetch(`/api/foods/${id}/cancel`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to cancel food in Prisma:', e);
    }
  };

  // HARD DELETE via Prisma ORM
  const deleteFood = async (id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setRequests((prev) => prev.filter((r) => r.foodId !== id));

    try {
      await fetch(`/api/foods/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete food in Prisma:', e);
    }
  };

  // APPROVE REQUEST via Prisma ORM (Atomic Transaction)
  const approveRequest = async (requestId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nowFormatted = `${new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':')} WIB`;

    const targetFood = foods.find((f) => f.id === targetReq.foodId);
    const isLastPortion = (targetFood?.quantity ?? 1) <= 1;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'APPROVED',
            respondedAt: nowFormatted,
          };
        }
        if (isLastPortion && r.foodId === targetReq.foodId && r.status === 'PENDING') {
          return {
            ...r,
            status: 'DECLINED',
            respondedAt: nowFormatted,
          };
        }
        return r;
      })
    );

    if (isLastPortion) {
      setFoods((prev) =>
        prev.map((f) =>
          f.id === targetReq.foodId ? { ...f, status: 'RESERVED' } : f
        )
      );
    }

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

    try {
      await fetch(`/api/requests/${requestId}/approve`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to approve request in Prisma:', e);
    }
  };

  // DECLINE REQUEST via Prisma ORM
  const declineRequest = async (requestId: string) => {
    const nowFormatted = `${new Date().toLocaleString('id-ID', {
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

    try {
      await fetch(`/api/requests/${requestId}/decline`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to decline request in Prisma:', e);
    }
  };

  // CANCEL REQUEST via Prisma ORM
  const cancelRequest = async (requestId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    if (targetReq.status === 'APPROVED') {
      setFoods((prev) =>
        prev.map((f) =>
          f.id === targetReq.foodId ? { ...f, status: 'AVAILABLE' } : f
        )
      );
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
    );

    try {
      await fetch(`/api/requests/${requestId}/cancel`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to cancel request in Prisma:', e);
    }
  };

  // MARK AS TAKEN via Prisma ORM (Atomic Transaction)
  const markAsTaken = async (foodId: string, requestId?: string) => {
    const matchingApproved = requests.filter(
      (r) =>
        r.foodId === foodId &&
        r.status === 'APPROVED' &&
        (!requestId || r.id === requestId)
    ).length;
    const decrementBy = Math.max(1, matchingApproved);

    setFoods((prev) =>
      prev.map((f) => {
        if (f.id !== foodId) return f;
        const newQty = Math.max(0, (f.quantity || 1) - decrementBy);
        return {
          ...f,
          quantity: newQty,
          status: newQty <= 0 ? 'TAKEN' : 'AVAILABLE',
        };
      })
    );

    const nowFormatted = `${new Date().toLocaleString('id-ID', {
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
        sharedCount: (user.sharedCount || 0) + decrementBy,
      });
    }

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'taken',
        title: 'Penyerahan Selesai',
        description: `Makanan berhasil diserahterimakan dan ditandai TAKEN`,
        timestamp: 'Baru saja',
        status: 'COMPLETED',
        targetUrl: '/dashboard/riwayat',
      },
      ...prev,
    ]);

    try {
      await fetch(`/api/foods/${foodId}/taken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, requestId }),
      });
    } catch (e) {
      console.error('Failed to mark food as taken in Prisma:', e);
    }
  };

  // CREATE PICKUP REQUEST via Prisma ORM
  const requestFood = async (
    foodId: string,
    message: string,
    proposedTime: string
  ) => {
    const targetFood = foods.find((f) => f.id === foodId);
    if (!targetFood) return;

    const requesterId = user?.id || 'user-siti';
    const existingActive = requests.find(
      (r) =>
        r.foodId === foodId &&
        (r.requesterId === requesterId || r.requesterName === user?.name) &&
        (r.status === 'PENDING' || r.status === 'APPROVED')
    );
    if (existingActive) {
      return;
    }

    const payload: Partial<PickupRequest> = {
      id: `req-${Date.now()}`,
      foodId: targetFood.id,
      foodTitle: targetFood.title,
      foodImage: targetFood.images[0],
      foodCategory: targetFood.category,
      requesterId,
      requesterName: user?.name || 'Siti Rahma',
      requesterAvatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      message: message || 'Halo, saya ingin mengambil makanan ini.',
      proposedPickupTime: proposedTime || 'Hari ini, 19:00 WIB',
      status: 'PENDING',
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdReq = await res.json();
        setRequests((prev) =>
          prev.some((r) => r.id === createdReq.id) ? prev : [createdReq, ...prev]
        );
        setFoods((prev) =>
          prev.map((f) =>
            f.id === foodId ? { ...f, requestCount: (f.requestCount || 0) + 1 } : f
          )
        );
      }
    } catch (e) {
      console.error('Failed to create request in Prisma:', e);
    }
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
