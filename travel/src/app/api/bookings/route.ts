import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { ensureBookingsSchema } from '@/db/ensureBookingsSchema';
import { eq, like, and, or, desc, type SQL } from 'drizzle-orm';

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
      paymentId
    } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: 'Name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ 
        error: 'Email is required',
        code: 'MISSING_EMAIL' 
      }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ 
        error: 'Phone is required',
        code: 'MISSING_PHONE' 
      }, { status: 400 });
    }

    if (!pickup || !pickup.trim()) {
      return NextResponse.json({ 
        error: 'Pickup location is required',
        code: 'MISSING_PICKUP' 
      }, { status: 400 });
    }

    if (!drop || !drop.trim()) {
      return NextResponse.json({ 
        error: 'Drop location is required',
        code: 'MISSING_DROP' 
      }, { status: 400 });
    }

    if (!travelDate || !travelDate.trim()) {
      return NextResponse.json({
        error: 'Travel date is required',
        code: 'MISSING_TRAVEL_DATE'
      }, { status: 400 });
    }

    const parsedTravelDate = new Date(travelDate);
    if (Number.isNaN(parsedTravelDate.getTime())) {
      return NextResponse.json({
        error: 'Invalid travel date',
        code: 'INVALID_TRAVEL_DATE'
      }, { status: 400 });
    }

    if (tripDays === undefined || tripDays === null) {
      return NextResponse.json({
        error: 'Trip package days is required',
        code: 'MISSING_TRIP_DAYS'
      }, { status: 400 });
    }

    const tripDaysNum = Number.parseInt(tripDays, 10);
    if (Number.isNaN(tripDaysNum) || tripDaysNum <= 0) {
      return NextResponse.json({
        error: 'Trip package days must be a positive whole number',
        code: 'INVALID_TRIP_DAYS'
      }, { status: 400 });
    }

    if (members === undefined || members === null) {
      return NextResponse.json({
        error: 'Members count is required',
        code: 'MISSING_MEMBERS'
      }, { status: 400 });
    }

    const membersNum = Number.parseInt(members, 10);
    if (Number.isNaN(membersNum) || membersNum <= 0) {
      return NextResponse.json({
        error: 'Members count must be a positive whole number',
        code: 'INVALID_MEMBERS'
      }, { status: 400 });
    }

    if (!destination || !destination.trim()) {
      return NextResponse.json({ 
        error: 'Destination is required',
        code: 'MISSING_DESTINATION' 
      }, { status: 400 });
    }

    if (!vehicleType || !vehicleType.trim()) {
      return NextResponse.json({ 
        error: 'Vehicle type is required',
        code: 'MISSING_VEHICLE_TYPE' 
      }, { status: 400 });
    }

    // Validate vehicleType enum
    if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
      return NextResponse.json({ 
        error: `Invalid vehicle type. Must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`,
        code: 'INVALID_VEHICLE_TYPE' 
      }, { status: 400 });
    }

    if (distance === undefined || distance === null) {
      return NextResponse.json({ 
        error: 'Distance is required',
        code: 'MISSING_DISTANCE' 
      }, { status: 400 });
    }

    // Validate distance is a positive number
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      return NextResponse.json({ 
        error: 'Distance must be a positive number',
        code: 'INVALID_DISTANCE' 
      }, { status: 400 });
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ 
        error: 'Price is required',
        code: 'MISSING_PRICE' 
      }, { status: 400 });
    }

    // Validate price is a positive number
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ 
        error: 'Price must be a positive number',
        code: 'INVALID_PRICE' 
      }, { status: 400 });
    }

    // Validate paymentStatus if provided
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ 
        error: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`,
        code: 'INVALID_PAYMENT_STATUS' 
      }, { status: 400 });
    }

    // Create booking with auto-generated fields
    const newBooking = await db.insert(bookings)
      .values({
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
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureBookingsSchema();

    const searchParams = request.nextUrl.searchParams;
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Search and filter parameters
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');
    const vehicleType = searchParams.get('vehicleType');

    // Build query conditions
    const conditions: SQL[] = [];

    // Search across name, email, and phone
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          like(bookings.name, searchTerm),
          like(bookings.email, searchTerm),
          like(bookings.phone, searchTerm)
        )!
      );
    }

    // Filter by payment status
    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      conditions.push(eq(bookings.paymentStatus, paymentStatus));
    }

    // Filter by vehicle type
    if (vehicleType && VALID_VEHICLE_TYPES.includes(vehicleType)) {
      conditions.push(eq(bookings.vehicleType, vehicleType));
    }

    const results = conditions.length > 0
      ? await db.select()
          .from(bookings)
          .where(and(...conditions)!)
          .orderBy(desc(bookings.createdAt))
          .limit(limit)
          .offset(offset)
      : await db.select()
          .from(bookings)
          .orderBy(desc(bookings.createdAt))
          .limit(limit)
          .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
