import { NextRequest, NextResponse } from 'next/server';
import { and, eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { bookings } from '@/db/schema';

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

    const contactCondition = email && phone
      ? or(eq(bookings.email, email), eq(bookings.phone, phone))
      : email
        ? eq(bookings.email, email)
        : eq(bookings.phone, phone!);

    const matchingBookings = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), contactCondition!))
      .limit(1);

    if (matchingBookings.length === 0) {
      return NextResponse.json(
        { error: 'No booking matched these details. Please check your booking ID and contact details.' },
        { status: 404 }
      );
    }

    const booking = matchingBookings[0];

    if (booking.paymentStatus === 'cancelled') {
      return NextResponse.json(
        { message: 'This booking is already cancelled.', booking },
        { status: 200 }
      );
    }

    const updatedBooking = await db
      .update(bookings)
      .set({ paymentStatus: 'cancelled' })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json(
      {
        message: 'Your booking has been cancelled successfully.',
        booking: updatedBooking[0],
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
