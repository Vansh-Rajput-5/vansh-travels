import { NextRequest, NextResponse } from 'next/server';
import { getBookingsCollection, withoutMongoId } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingId = Number(body?.bookingId);
    const email = body?.email?.trim()?.toLowerCase();
    const phone = body?.phone?.trim();

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: 'Valid booking ID is required.' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Provide the email address or phone number used for the booking.' },
        { status: 400 }
      );
    }

    const contactFilters = [];

    if (email) {
      contactFilters.push({ email });
    }

    if (phone) {
      contactFilters.push({ phone });
    }

    const bookings = await getBookingsCollection();
    const booking = await bookings.findOne({
      id: bookingId,
      ...(contactFilters.length === 1 ? contactFilters[0] : { $or: contactFilters }),
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'No booking matched these details. Please check your booking ID and contact details.' },
        { status: 404 }
      );
    }

    if (booking.paymentStatus === 'cancelled') {
      return NextResponse.json(
        { message: 'This booking is already cancelled.', booking: withoutMongoId(booking) },
        { status: 200 }
      );
    }

    const updatedBooking = await bookings.findOneAndUpdate(
      { id: bookingId },
      { $set: { paymentStatus: 'cancelled' } },
      { returnDocument: 'after' }
    );

    return NextResponse.json(
      {
        message: 'Your booking has been cancelled successfully.',
        booking: withoutMongoId(updatedBooking!),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Support cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
