import { getAdminCollection, getNextSequence } from '@/db';
import bcrypt from 'bcrypt';

async function main() {
  const adminCollection = await getAdminCollection();
  const existingAdmin = await adminCollection.findOne({ email: 'admin@vanshtravels.com' });

  if (existingAdmin) {
    console.log('Admin already exists, skipping seed');
    return;
  }

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const id = await getNextSequence('admin');

  await adminCollection.insertOne({
    id,
    email: 'admin@vanshtravels.com',
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });

  console.log('Admin seeder completed successfully');
}

main().catch((error) => {
  console.error('Seeder failed:', error);
});
