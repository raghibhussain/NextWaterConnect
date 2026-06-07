import { NextResponse } from "next/server";
import { db } from "@/lib/db";


// GET /api/consumer/recommend?area=Karachi
// ✅ Recommends SUPPLIERS to consumers based on service area
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area");

    // ✅ Validate area parameter
    if (!area || area.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Area parameter is required. Use: /api/consumer/recommend?area=Karachi",
        },
        { status: 400 }
      );
    }

    const decodedArea = decodeURIComponent(area).trim();

    // ✅ Find SUPPLIERS matching the area (not consumers!)
    const recommended = await db.supplier.findMany({
      where: {
        service_area: {
          contains: decodedArea,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        // ✅ Include supplier type for more details
        supplier_type: true,
      },
    });

    // ✅ Handle no results
    if (recommended.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `No suppliers found in area: "${decodedArea}"`,
          total: 0,
          recommended: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
        success: true,
        message: `Found ${recommended.length} supplier(s) in "${decodedArea}"`,
        total: recommended.length,
        recommended: recommended,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Recommendation fetch error:", error);
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