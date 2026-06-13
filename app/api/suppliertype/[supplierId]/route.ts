import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ supplierId: string }>;
}

const VALID_CATEGORIES = ["Tanker", "Drinking Water"];

// GET /api/suppliertype/[supplierId]
export async function GET(request: Request, { params }: Params) {
  try {
    const { supplierId } = await params;

    if (!supplierId || isNaN(Number(supplierId))) {
      return NextResponse.json(
        { success: false, message: "Invalid supplier ID format" },
        { status: 400 }
      );
    }

    const supplierExists = await db.supplier.findUnique({
      where: { id: BigInt(supplierId) },
    });

    if (!supplierExists) {
      return NextResponse.json(
        { success: false, message: `Supplier with ID ${supplierId} not found` },
        { status: 404 }
      );
    }

    const supplierType = await db.supplier_type.findUnique({
      where: { supplier_id: BigInt(supplierId) },
      include: {
        supplier: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!supplierType) {
      return NextResponse.json(
        {
          success: false,
          message: `No supplier type found for supplier ID ${supplierId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, supplier_type: supplierType },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get supplier type error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/suppliertype/[supplierId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const { supplierId } = await params;
    const body = await request.json();

    if (!supplierId || isNaN(Number(supplierId))) {
      return NextResponse.json(
        { success: false, message: "Invalid supplier ID format" },
        { status: 400 }
      );
    }

    const existingType = await db.supplier_type.findUnique({
      where: { supplier_id: BigInt(supplierId) },
    });

    if (!existingType) {
      return NextResponse.json(
        {
          success: false,
          message: `No supplier type found for supplier ID ${supplierId}. Use POST to create it first.`,
        },
        { status: 404 }
      );
    }

    const { vehicle_no, category } = body;

    if (!vehicle_no && !category) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one field required: vehicle_no or category",
        },
        { status: 400 }
      );
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (vehicle_no !== undefined) updateData.vehicle_no = String(vehicle_no);
    if (category !== undefined)   updateData.category   = String(category);

    const updatedType = await db.supplier_type.update({
      where: { supplier_id: BigInt(supplierId) },
      data: updateData,
      include: { supplier: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier type updated successfully",
        supplier_type: updatedType,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Update supplier type error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}