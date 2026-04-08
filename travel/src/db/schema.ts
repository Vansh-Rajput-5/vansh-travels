export interface BookingDocument {
  _id?: string;
  id: number;
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
