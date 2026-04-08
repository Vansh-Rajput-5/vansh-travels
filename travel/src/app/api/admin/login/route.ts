import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admin } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const DEFAULT_ADMIN_EMAIL = 'admin@vanshtravels.com';
const LEGACY_ADMIN_EMAIL = 'admin@diveshtravels.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Sanitize email input
    const sanitizedEmail = email.trim().toLowerCase();

    // Query admin table for user with matching email
    let adminUser = await db.select()
      .from(admin)
      .where(eq(admin.email, sanitizedEmail))
      .limit(1);

    // Allow the renamed brand email to continue working with older seeded data.
    if (adminUser.length === 0 && sanitizedEmail === DEFAULT_ADMIN_EMAIL) {
      adminUser = await db.select()
        .from(admin)
        .where(eq(admin.email, LEGACY_ADMIN_EMAIL))
        .limit(1);
    }

    // Bootstrap the default admin if the table is empty and the UI default credentials are used.
    if (
      adminUser.length === 0 &&
      sanitizedEmail === DEFAULT_ADMIN_EMAIL &&
      password === DEFAULT_ADMIN_PASSWORD
    ) {
      const existingAdmins = await db.select({ id: admin.id }).from(admin).limit(1);

      if (existingAdmins.length === 0) {
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

        await db.insert(admin).values({
          email: DEFAULT_ADMIN_EMAIL,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        });

        adminUser = await db.select()
          .from(admin)
          .where(eq(admin.email, DEFAULT_ADMIN_EMAIL))
          .limit(1);
      }
    }

    // Check if admin user exists
    if (adminUser.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, adminUser[0].password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Migrate the old admin email to the new Vansh Travels branding after a successful login.
    if (adminUser[0].email === LEGACY_ADMIN_EMAIL && sanitizedEmail === DEFAULT_ADMIN_EMAIL) {
      await db
        .update(admin)
        .set({ email: DEFAULT_ADMIN_EMAIL })
        .where(eq(admin.id, adminUser[0].id));

      adminUser[0].email = DEFAULT_ADMIN_EMAIL;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'vansh-travels-secret-key-2024';
    const token = jwt.sign(
      {
        id: adminUser[0].id,
        email: adminUser[0].email
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return success response with token and admin data (excluding password)
    return NextResponse.json(
      {
        success: true,
        token,
        admin: {
          id: adminUser[0].id,
          email: adminUser[0].email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
