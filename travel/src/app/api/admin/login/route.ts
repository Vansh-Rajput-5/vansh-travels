import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection, getNextSequence } from '@/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const DEFAULT_ADMIN_EMAIL = 'admin@vanshtravels.com';
const LEGACY_ADMIN_EMAIL = 'admin@diveshtravels.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required', code: 'MISSING_EMAIL' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required', code: 'MISSING_PASSWORD' }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const adminCollection = await getAdminCollection();

    let adminUser = await adminCollection.findOne({ email: sanitizedEmail });

    if (!adminUser && sanitizedEmail === DEFAULT_ADMIN_EMAIL) {
      adminUser = await adminCollection.findOne({ email: LEGACY_ADMIN_EMAIL });
    }

    if (!adminUser && sanitizedEmail === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const existingAdmin = await adminCollection.findOne({});

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
        const id = await getNextSequence('admin');

        const newAdmin = {
          id,
          email: DEFAULT_ADMIN_EMAIL,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        };

        await adminCollection.insertOne(newAdmin);
        adminUser = newAdmin;
      }
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, { status: 401 });
    }

    if (adminUser.email === LEGACY_ADMIN_EMAIL && sanitizedEmail === DEFAULT_ADMIN_EMAIL) {
      await adminCollection.updateOne({ id: adminUser.id }, { $set: { email: DEFAULT_ADMIN_EMAIL } });
      adminUser.email = DEFAULT_ADMIN_EMAIL;
    }

    const jwtSecret = process.env.JWT_SECRET || 'vansh-travels-secret-key-2024';
    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
