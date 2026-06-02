import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Look up user including linked sub-role profiles automatically
    const foundUser = await db.user.findFirst({
      where: {
        email: email,
        password: password, // Consider hashing passwords when migrating completely
      },
      include: {
        consumer: true,
        supplier: true,
      },
    });

    if (!foundUser) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 200 });
    }

    return NextResponse.json(serializeData(foundUser), { status: 200 });
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}