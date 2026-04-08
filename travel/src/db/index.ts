import { MongoClient, type Collection, type Db } from 'mongodb';
import type { AdminDocument, BookingDocument, CounterDocument } from '@/db/schema';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  return databaseUrl;
}

export async function getMongoClient() {
  if (!global.__mongoClientPromise__) {
    global.__mongoClientPromise__ = new MongoClient(getDatabaseUrl()).connect();
  }

  return global.__mongoClientPromise__;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}

export async function getBookingsCollection(): Promise<Collection<BookingDocument>> {
  const db = await getDb();
  return db.collection<BookingDocument>('bookings');
}

export async function getAdminCollection(): Promise<Collection<AdminDocument>> {
  const db = await getDb();
  return db.collection<AdminDocument>('admin');
}

async function getCountersCollection(): Promise<Collection<CounterDocument>> {
  const db = await getDb();
  return db.collection<CounterDocument>('counters');
}

export async function getNextSequence(sequenceName: string) {
  const counters = await getCountersCollection();
  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  return result?.value ?? 1;
}

export function withoutMongoId<T extends { _id?: unknown }>(document: T): Omit<T, '_id'> {
  const { _id, ...rest } = document;
  return rest;
}
