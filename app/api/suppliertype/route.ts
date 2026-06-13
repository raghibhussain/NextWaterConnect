import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_CATEGORIES = ["Tanker", "Drinking Water"];

// POST /api/suppliertype
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplier_id, vehicle_no, category } = body;

    if (!supplier_id) {
      return NextResponse.json(
        { success: false, message: "supplier_id is required" },
        { status: 400 }
      );
    }

    if (!vehicle_no || !category) {
      return NextResponse.json(
        { success: false, message: "vehicle_no and category are required" },
        { status: 400 }
      );
    }

    if (isNaN(Number(supplier_id))) {
      return NextResponse.json(
        { success: false, message: "supplier_id must be a valid number" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const supplierExists = await db.supplier.findUnique({
      where: { id: BigInt(supplier_id) },
    });

    if (!supplierExists) {
      return NextResponse.json(
        { success: false, message: `Supplier with ID ${supplier_id} not found` },
        { status: 404 }
      );
    }

    const existingType = await db.supplier_type.findUnique({
      where: { supplier_id: BigInt(supplier_id) },
    });

    if (existingType) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier type already exists. Use PUT to update it.",
        },
        { status: 409 }
      );
    }

    const newSupplierType = await db.supplier_type.create({
      data: {
        supplier_id: BigInt(supplier_id),
        vehicle_no: String(vehicle_no),
        category: String(category),
      },
      include: { supplier: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier type created successfully",
        supplier_type: newSupplierType,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Supplier type creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}