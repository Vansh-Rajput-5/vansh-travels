import { NextRequest, NextResponse } from 'next/server';
import { getBookingsCollection, getNextSequence, withoutMongoId } from '@/db';
import { ensureBookingsSchema } from '@/db/ensureBookingsSchema';
import { sendBookingConfirmationEmail } from '@/lib/email';

const VALID_VEHICLE_TYPES = ['Sedan', 'SUV', 'Tempo Traveller', 'Mini Bus'];
const VALID_PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'cancelled'];

export async function POST(request: NextRequest) {
  try {
    await ensureBookingsSchema();

    const body = await request.json();
    const {
      name,
      email,
      phone,
      pickup,
      drop,
      travelDate,
      tripDays,
      members,
      destination,
      vehicleType,
      distance,
      price,
      paymentStatus,
      paymentId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required', code: 'MISSING_NAME' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required', code: 'MISSING_EMAIL' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format', code: 'INVALID_EMAIL' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Phone is required', code: 'MISSING_PHONE' }, { status: 400 });
    }

    if (!pickup || !pickup.trim()) {
      return NextResponse.json({ error: 'Pickup location is required', code: 'MISSING_PICKUP' }, { status: 400 });
    }

    if (!drop || !drop.trim()) {
      return NextResponse.json({ error: 'Drop location is required', code: 'MISSING_DROP' }, { status: 400 });
    }

    if (!travelDate || !travelDate.trim()) {
      return NextResponse.json({ error: 'Travel date is required', code: 'MISSING_TRAVEL_DATE' }, { status: 400 });
    }

    const parsedTravelDate = new Date(travelDate);
    if (Number.isNaN(parsedTravelDate.getTime())) {
      return NextResponse.json({ error: 'Invalid travel date', code: 'INVALID_TRAVEL_DATE' }, { status: 400 });
    }

    if (tripDays === undefined || tripDays === null) {
      return NextResponse.json({ error: 'Trip package days is required', code: 'MISSING_TRIP_DAYS' }, { status: 400 });
    }

    const tripDaysNum = Number.parseInt(String(tripDays), 10);
    if (Number.isNaN(tripDaysNum) || tripDaysNum <= 0) {
      return NextResponse.json(
        { error: 'Trip package days must be a positive whole number', code: 'INVALID_TRIP_DAYS' },
        { status: 400 }
      );
    }

    if (members === undefined || members === null) {
      return NextResponse.json({ error: 'Members count is required', code: 'MISSING_MEMBERS' }, { status: 400 });
    }

    const membersNum = Number.parseInt(String(members), 10);
    if (Number.isNaN(membersNum) || membersNum <= 0) {
      return NextResponse.json(
        { error: 'Members count must be a positive whole number', code: 'INVALID_MEMBERS' },
        { status: 400 }
      );
    }

    if (!destination || !destination.trim()) {
      return NextResponse.json({ error: 'Destination is required', code: 'MISSING_DESTINATION' }, { status: 400 });
    }

    if (!vehicleType || !vehicleType.trim()) {
      return NextResponse.json({ error: 'Vehicle type is required', code: 'MISSING_VEHICLE_TYPE' }, { status: 400 });
    }

    if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
      return NextResponse.json(
        { error: `Invalid vehicle type. Must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`, code: 'INVALID_VEHICLE_TYPE' },
        { status: 400 }
      );
    }

    if (distance === undefined || distance === null) {
      return NextResponse.json({ error: 'Distance is required', code: 'MISSING_DISTANCE' }, { status: 400 });
    }

    const distanceNum = Number.parseFloat(String(distance));
    if (Number.isNaN(distanceNum) || distanceNum <= 0) {
      return NextResponse.json({ error: 'Distance must be a positive number', code: 'INVALID_DISTANCE' }, { status: 400 });
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Price is required', code: 'MISSING_PRICE' }, { status: 400 });
    }

    const priceNum = Number.parseFloat(String(price));
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number', code: 'INVALID_PRICE' }, { status: 400 });
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`, code: 'INVALID_PAYMENT_STATUS' },
        { status: 400 }
      );
    }

    const bookings = await getBookingsCollection();
    const id = await getNextSequence('bookings');
    const newBooking = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      pickup: pickup.trim(),
      drop: drop.trim(),
      travelDate: travelDate.trim(),
      tripDays: tripDaysNum,
      members: membersNum,
      destination: destination.trim(),
      vehicleType: vehicleType.trim(),
      distance: distanceNum,
      price: priceNum,
      paymentStatus: paymentStatus || 'pending',
      paymentId: paymentId?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    await bookings.insertOne(newBooking);

    try {
      await sendBookingConfirmationEmail(newBooking);
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureBookingsSchema();

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Number.parseInt(searchParams.get('limit') ?? '10', 10), 100);
    const offset = Number.parseInt(searchParams.get('offset') ?? '0', 10);
    const search = searchParams.get('search')?.trim();
    const paymentStatus = searchParams.get('paymentStatus');
    const vehicleType = searchParams.get('vehicleType');

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    if (vehicleType && VALID_VEHICLE_TYPES.includes(vehicleType)) {
      query.vehicleType = vehicleType;
    }

    const bookings = await getBookingsCollection();
    const results = await bookings
      .find(query)
      .sort({ createdAt: -1 })
      .skip(Math.max(offset, 0))
      .limit(Math.max(limit, 0))
      .toArray();

    return NextResponse.json(results.map((booking) => withoutMongoId(booking)), { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
