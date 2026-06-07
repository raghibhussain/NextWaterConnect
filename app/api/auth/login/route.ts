import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ No serializeData needed!

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const foundUser = await db.user.findFirst({
      where: { email, password },
      include: { consumer: true, supplier: true },
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ Return directly - BigInt auto-serializes!
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        role: foundUser.role,
        user: foundUser,
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}