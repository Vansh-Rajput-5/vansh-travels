import { db } from '@/db';
import { admin } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    const sampleAdmin = [
        {
            email: 'admin@vanshtravels.com',
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(admin).values(sampleAdmin);
    
    console.log('✅ Admin seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
