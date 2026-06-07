import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

const ALLOWED_ROLES = ["USER", "CONSUMER", "SUPPLIER", "ADMIN"];

// ✅ No serializeData needed!

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid profile ID format" },
        { status: 400 }
      );
    }

    const userProfile = await db.user.findUnique({
      where: { id: BigInt(id) },
      include: { consumer: true, supplier: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: `Profile with ID ${id} not found` },
        { status: 404 }
      );
    }

    // ✅ Return directly!
    return NextResponse.json(
      { success: true, profile: userProfile },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid profile ID format" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { id: BigInt(id) },
      include: { consumer: true, supplier: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: `Profile with ID ${id} not found` },
        { status: 404 }
      );
    }

    const { email, name, password, phone, role, consumer, supplier } = body;

    if (role && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, message: `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const userUpdateData: any = {};
    if (email    !== undefined) userUpdateData.email    = email;
    if (name     !== undefined) userUpdateData.name     = name;
    if (password !== undefined) userUpdateData.password = password;
    if (phone    !== undefined) userUpdateData.phone    = phone;
    if (role     !== undefined) userUpdateData.role     = role;

    if (consumer && existingUser.consumer) {
      userUpdateData.consumer = {
        update: {
          ...(consumer.address   !== undefined && { address:   consumer.address }),
          ...(consumer.full_name !== undefined && { full_name: consumer.full_name }),
        },
      };
    }

    if (supplier && existingUser.supplier) {
      userUpdateData.supplier = {
        update: {
          ...(supplier.company_name !== undefined && { company_name: supplier.company_name }),
          ...(supplier.service_area !== undefined && { service_area: supplier.service_area }),
        },
      };
    }

    if (Object.keys(userUpdateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: BigInt(id) },
      data: userUpdateData,
      include: { consumer: true, supplier: true },
    });

    // ✅ Return directly!
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        profile: updatedUser,
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update profile", details: error.message },
      { status: 400 }
    );
  }
}