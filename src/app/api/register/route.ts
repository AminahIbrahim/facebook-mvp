import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}