export type FoodCategory =
  | 'makanan_berat'
  | 'roti_kue'
  | 'buah_sayur'
  | 'bahan_mentah'
  | 'minuman'
  | 'lainnya'
  | 'berbayar';

export type FoodStatus = 'AVAILABLE' | 'RESERVED' | 'TAKEN' | 'CANCELLED';

export type RequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleBadge: string;
  joinedDate: string;
  sharedCount: number;
  receivedCount: number;
}

export interface PickupDetails {
  id?: string;
  foodId: string;
  fullAddress: string;
  landmark: string;
  contactPhone: string;
}

export interface PickupRequest {
  id: string;
  foodId: string;
  foodTitle?: string;
  foodImage?: string;
  foodCategory?: FoodCategory;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterStats?: string;
  message: string;
  proposedPickupTime: string;
  status: RequestStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface FoodItem {
  id: string;
  userId: string;
  ownerName: string;
  title: string;
  category: FoodCategory;
  description: string;
  quantity: number;
  unit: string;
  preparedAt: string;
  pickupDeadline: string;
  areaLabel: string;
  storageNotes: string;
  allergens: string[];
  status: FoodStatus;
  images: string[];
  createdAt: string;
  pickupDetails: PickupDetails;
  requestCount?: number;
  price?: number;
  type?: 'gratis' | 'berbayar';
  mapsUrl?: string;
  qrisUrl?: string;
  whatsappNumber?: string;
  addressNote?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ActivityLog {
  id: string;
  type: 'request_in' | 'approved' | 'declined' | 'taken' | 'posted';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  targetUrl: string;
}
