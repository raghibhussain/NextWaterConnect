import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ area: string }>;
}

// GET /api/supplier/search/area/[area]
export async function GET(request: Request, { params }: Params) {
  try {
    const { area } = await params;

    // ✅ Validate area
    if (!area || area.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Area parameter is required",
        },
        { status: 400 }
      );
    }

    const decodedArea = decodeURIComponent(area).trim();

    // ✅ Find suppliers with full details
    const suppliers = await db.supplier.findMany({
      where: {
        service_area: {
          contains: decodedArea,
        },
      },
      include: {
        // ✅ Include user details
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        // ✅ Include supplier type
        supplier_type: true,
      },
    });

    // ✅ Handle no results
    if (suppliers.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `No suppliers found in area: "${decodedArea}"`,
          total: 0,
          suppliers: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
        success: true,
        total: suppliers.length,
        area: decodedArea,
        suppliers: suppliers,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Supplier area search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}