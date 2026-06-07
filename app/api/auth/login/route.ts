import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { generateToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ✅ Validate fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // ✅ Find user by email only
    const foundUser = await db.user.findFirst({
      where: { email: email },
      include: { consumer: true, supplier: true },
    });

    // ✅ Check user exists
    if (!foundUser || !foundUser.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ Verify hashed password
    const isValidPassword = await verifyPassword(
      password,
      foundUser.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ Generate JWT token
    const token = generateToken({
      userId: foundUser.id.toString(),
      email:  foundUser.email  ?? "",
      role:   foundUser.role   ?? "",
    });

    // ✅ Return token + user data
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token:   token,        // ✅ JWT Token returned here!
        role:    foundUser.role,
        user:    foundUser,
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