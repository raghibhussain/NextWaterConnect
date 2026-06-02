import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// Custom serializer to handle BigInt conversions safely
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// ==========================================
// 1. GET PROFILE (Equivalent to @GetMapping("/{id}"))
// ==========================================
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Fetch user and include their connected role details automatically
    const userProfile = await db.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        consumer: true,
        supplier: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(serializeData(userProfile), { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ==========================================
// 2. UPDATE PROFILE (Equivalent to @PutMapping("/update/{id}"))
// ==========================================
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json(); // Reads the generic dynamic fields sent by frontend

    // Destructure properties to separate core User fields from sub-role fields
    const { email, name, password, phone, role, consumer, supplier } = body;

    // Perform an atomic update operation using Prisma's nested update capabilities
    const updatedUser = await db.user.update({
      where: { id: BigInt(id) },
      data: {
        // Only update fields if they are provided in the payload body
        email: email,
        name: name,
        password: password,
        phone: phone,
        role: role,
        
        // If consumer fields are passed, update the nested relation table
        consumer: consumer ? {
          update: {
            address: consumer.address,
            full_name: consumer.full_name,
          }
        } : undefined,

        // If supplier fields are passed, update the nested relation table
        supplier: supplier ? {
          update: {
            company_name: supplier.company_name,
            service_area: supplier.service_area,
          }
        } : undefined,
      },
      include: {
        consumer: true,
        supplier: true,
      }
    });

    return NextResponse.json(serializeData(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile data" }, { status: 400 });
  }
}