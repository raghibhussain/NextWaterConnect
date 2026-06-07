import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ type: string; id: string }>;
}

// GET /api/booking/lookup/[type]/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const { type, id } = await params;

    // ✅ Validate ID format
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // ✅ Validate type
    if (!["consumer", "supplier"].includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid type "${type}". Allowed: consumer, supplier` 
        },
        { status: 400 }
      );
    }

    let bookings: any[] = [];

    if (type === "consumer") {
      bookings = await db.bookings.findMany({
        where: { consumer_id: BigInt(id) },
        include: {
          supplier: {
            include: {
              // ✅ Include supplier's user details for full context
              user: true,
            },
          },
        },
        orderBy: { booking_date: "desc" }, // ✅ Most recent first
      });
    } else if (type === "supplier") {
      bookings = await db.bookings.findMany({
        where: { supplier_id: BigInt(id) },
        include: {
          consumer: {
            include: {
              // ✅ Include consumer's user details for full context
              user: true,
            },
          },
        },
        orderBy: { booking_date: "desc" }, // ✅ Most recent first
      });
    }

    // ✅ Handle empty results gracefully
    if (bookings.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `No bookings found for this ${type}`,
          total: 0,
          bookings: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
        success: true,
        total: bookings.length,
        bookings: bookings,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Booking lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}