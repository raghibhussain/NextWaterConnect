import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ role: string }>;
}

// Helper to convert BigInt fields to strings before responding
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// POST /api/auth/register/[role]
export async function POST(request: Request, { params }: Params) {
  try {
    const { role } = await params;
    const body = await request.json();

    // --- CASE 1: Standard General User ---
    if (role === "user") {
      const newUser = await db.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: body.password,
          phone: body.phone,
          role: body.role || "USER",
        },
      });
      return NextResponse.json(serializeData(newUser), { status: 201 });
    }

    // --- CASE 2: Consumer Profile Registration ---
    if (role === "consumer") {
      // 1. Create the parent User record first to generate a valid ID
      const createdUser = await db.user.create({
        data: {
          email: body.email,
          name: body.full_name, // Map their name field to user table
          password: body.password,
          phone: body.phone,
          role: "CONSUMER",
        },
      });

      // 2. Use the new user's ID to build the dependent Consumer profile
      const newConsumer = await db.consumer.create({
        data: {
          id: createdUser.id, // Links perfectly with the master User record
          address: body.address,
          full_name: body.full_name,
        },
      });

      return NextResponse.json(
        serializeData({ message: "Consumer registered successfully", user: createdUser, consumer: newConsumer }),
        { status: 201 }
      );
    }

    // --- CASE 3: Supplier Profile Registration ---
    if (role === "supplier") {
      // 1. Create the parent User record first to generate a valid ID
      const createdUser = await db.user.create({
        data: {
          email: body.email,
          name: body.company_name, // Map their company name to user table
          password: body.password,
          phone: body.phone,
          role: "SUPPLIER",
        },
      });

      // 2. Use the new user's ID to build the dependent Supplier profile
      const newSupplier = await db.supplier.create({
        data: {
          id: createdUser.id, // Links perfectly with the master User record
          company_name: body.company_name,
          service_area: body.service_area,
        },
      });

      return NextResponse.json(
        serializeData({ message: "Supplier registered successfully", user: createdUser, supplier: newSupplier }),
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid registration role" }, { status: 400 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed", details: error.message },
      { status: 500 }
    );
  }
}