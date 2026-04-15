import { NextRequest, NextResponse } from "next/server";
import { getReviewsCollection, getNextSequence, withoutMongoId } from "@/db";

export async function POST(request: NextRequest) {
  try {
    const { destination, rating, comment, userId, userName } = await request.json();

    if (!destination || !rating || !comment || !userId || !userName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const reviews = await getReviewsCollection();
    const id = await getNextSequence("reviews");

    const newReview = {
      id,
      userId,
      userName,
      destination,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    await reviews.insertOne(newReview);

    return NextResponse.json(withoutMongoId(newReview), { status: 201 });
  } catch (error) {
    console.error("Post review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');
    const limit = Math.min(Number.parseInt(searchParams.get('limit') ?? '50', 10), 100);

    const query: Record<string, unknown> = {};

    if (destination) {
      query.destination = destination;
    }

    const reviews = await getReviewsCollection();
    const results = await reviews
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(results.map((review) => withoutMongoId(review)), { status: 200 });
  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
