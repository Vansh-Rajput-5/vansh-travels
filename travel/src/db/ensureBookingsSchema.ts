import { client } from '@/db';

let bookingsSchemaReady: Promise<void> | null = null;

const REQUIRED_BOOKING_COLUMNS = [
  {
    name: 'travel_date',
    statement: "ALTER TABLE `bookings` ADD COLUMN `travel_date` text NOT NULL DEFAULT '';",
  },
  {
    name: 'trip_days',
    statement: 'ALTER TABLE `bookings` ADD COLUMN `trip_days` integer NOT NULL DEFAULT 1;',
  },
  {
    name: 'members',
    statement: 'ALTER TABLE `bookings` ADD COLUMN `members` integer NOT NULL DEFAULT 1;',
  },
];

export async function ensureBookingsSchema() {
  if (!bookingsSchemaReady) {
    bookingsSchemaReady = ensureBookingsSchemaInternal().catch((error) => {
      bookingsSchemaReady = null;
      throw error;
    });
  }

  await bookingsSchemaReady;
}

async function ensureBookingsSchemaInternal() {
  const result = await client.execute('PRAGMA table_info(`bookings`)');
  const existingColumns = new Set(result.rows.map((row) => String(row.name)));

  for (const column of REQUIRED_BOOKING_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      await client.execute(column.statement);
      existingColumns.add(column.name);
    }
  }
}
