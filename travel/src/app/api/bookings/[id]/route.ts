import { NextRequest, NextResponse } from 'next/server';
import { getBookingsCollection, withoutMongoId } from '@/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vansh-travels-secret-key-2024';
const VALID_PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'cancelled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    try {
      jwt.verify(parts[1], JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const bookingId = Number(id);
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
    }

    const body = await request.json();
    const paymentStatus = body?.paymentStatus?.trim();

    if (!paymentStatus || !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const bookings = await getBookingsCollection();
    const updatedBooking = await bookings.findOneAndUpdate(
      { id: bookingId },
      { $set: { paymentStatus } },
      { returnDocument: 'after' }
    );

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(withoutMongoId(updatedBooking), { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
