import { NextRequest, NextResponse } from 'next/server';
import { getBookingsCollection, withoutMongoId } from '@/db';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = Number(id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
    }

    const bookings = await getBookingsCollection();
    const existingBooking = await bookings.findOne({ id: bookingId });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (existingBooking.paymentStatus === 'cancelled') {
      return NextResponse.json(withoutMongoId(existingBooking), { status: 200 });
    }

    const updatedBooking = await bookings.findOneAndUpdate(
      { id: bookingId },
      { $set: { paymentStatus: 'cancelled' } },
      { returnDocument: 'after' }
    );

    return NextResponse.json(withoutMongoId(updatedBooking!), { status: 200 });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
