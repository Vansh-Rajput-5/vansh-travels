export interface BookingDocument {
  _id?: string;
  id: number;
  userId?: number; // Added to link booking to user
  name: string;
  email: string;
  phone: string;
  pickup: string;
  drop: string;
  travelDate: string;
  tripDays: number;
  members: number;
  destination: string;
  vehicleType: string;
  distance: number;
  price: number;
  paymentStatus: string;
  paymentId: string | null;
  createdAt: string;
}

export interface UserDocument {
  _id?: string;
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt: string;
}

export interface ReviewDocument {
  _id?: string;
  id: number;
  userId: number;
  userName: string;
  destination: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
}

export interface LikeDocument {
  _id?: string;
  userId: number;
  destination: string;
  createdAt: string;
}

export interface AdminDocument {
  _id?: string;
  id: number;
  email: string;
  password: string;
  createdAt: string;
}

export interface CounterDocument {
  _id: string;
  value: number;
}
