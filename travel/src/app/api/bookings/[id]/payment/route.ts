import { NextRequest, NextResponse } from 'next/server';
import { getBookingsCollection, withoutMongoId } from '@/db';

const VALID_PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'cancelled'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = Number(id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
    }

    const body = await request.json();
    const paymentStatus = body?.paymentStatus?.trim() || 'completed';
    const paymentId = body?.paymentId?.trim();

    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const bookings = await getBookingsCollection();
    const updatedBooking = await bookings.findOneAndUpdate(
      { id: bookingId },
      {
        $set: {
          paymentStatus,
          paymentId: paymentId || null,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(withoutMongoId(updatedBooking), { status: 200 });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
