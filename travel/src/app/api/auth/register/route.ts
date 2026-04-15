import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection, getNextSequence } from "@/db";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const users = await getUsersCollection();
    const existingUser = await users.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await getNextSequence("users");

    const newUser = {
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      createdAt: new Date().toISOString(),
    };

    await users.insertOne(newUser);

    // Don't return password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
