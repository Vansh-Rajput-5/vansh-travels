import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Bookings table
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  pickup: text('pickup').notNull(),
  drop: text('drop').notNull(),
  travelDate: text('travel_date').notNull(),
  tripDays: integer('trip_days').notNull(),
  members: integer('members').notNull(),
  destination: text('destination').notNull(),
  vehicleType: text('vehicle_type').notNull(), // Enum: Sedan, SUV, Tempo Traveller, Mini Bus
  distance: real('distance').notNull(),
  price: real('price').notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'), // Enum: pending, completed, failed
  paymentId: text('payment_id'),
  createdAt: text('created_at').notNull(),
});

// Admin table
export const admin = sqliteTable('admin', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Hashed with bcrypt
  createdAt: text('created_at').notNull(),
});
