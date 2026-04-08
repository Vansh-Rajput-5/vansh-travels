import { NextRequest, NextResponse } from 'next/server';

type Coordinates = {
  lat: number;
  lon: number;
};

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OSRM_BASE_URL = 'https://router.project-osrm.org';

async function geocodeLocation(query: string): Promise<Coordinates> {
  const url = `${NOMINATIM_BASE_URL}/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VanshTravelsBooking/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch location coordinates');
  }

  const results = await response.json();
  const best = results?.[0];

  if (!best?.lat || !best?.lon) {
    throw new Error('Location not found. Please enter a more specific address.');
  }

  return {
    lat: Number(best.lat),
    lon: Number(best.lon),
  };
}

function haversineDistanceKm(start: Coordinates, end: Coordinates): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLon = toRadians(end.lon - start.lon);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

async function getRoadDistanceKm(start: Coordinates, end: Coordinates): Promise<number> {
  const routeUrl = `${OSRM_BASE_URL}/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;
  const response = await fetch(routeUrl);

  if (!response.ok) {
    throw new Error('Unable to fetch route distance');
  }

  const data = await response.json();
  const distanceMeters = data?.routes?.[0]?.distance;

  if (!distanceMeters || typeof distanceMeters !== 'number') {
    throw new Error('Route not found');
  }

  return distanceMeters / 1000;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pickup = body?.pickup?.trim();
    const drop = body?.drop?.trim();

    if (!pickup) {
      return NextResponse.json({ error: 'Pickup location is required' }, { status: 400 });
    }

    if (!drop) {
      return NextResponse.json({ error: 'Drop location is required' }, { status: 400 });
    }

    const [pickupCoords, dropCoords] = await Promise.all([
      geocodeLocation(pickup),
      geocodeLocation(drop),
    ]);

    let distanceKm: number;

    try {
      distanceKm = await getRoadDistanceKm(pickupCoords, dropCoords);
    } catch {
      // Fallback when routing service is unavailable.
      distanceKm = haversineDistanceKm(pickupCoords, dropCoords) * 1.2;
    }

    if (!distanceKm || distanceKm <= 0) {
      return NextResponse.json({ error: 'Unable to calculate distance' }, { status: 400 });
    }

    return NextResponse.json(
      { distanceKm: Number(distanceKm.toFixed(1)) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Distance API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
