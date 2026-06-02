import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ bookingId: string; action: string }>;
}

function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// PUT /api/bookings/[bookingId]/[action]?supplierId=XX
export async function PUT(request: Request, { params }: Params) {
  try {
    const { bookingId, action } = await params;
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json({ error: "Missing supplier verification" }, { status: 400 });
    }

    // Verify booking profile details before modifying state
    const currentBooking = await db.bookings.findUnique({
      where: { id: BigInt(bookingId) },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: "Booking record missing" }, { status: 404 });
    }

    if (currentBooking.supplier_id !== BigInt(supplierId)) {
      return NextResponse.json({ error: "Unauthorized access profile" }, { status: 403 });
    }

    // Determine target state based on URL action token
    let targetStatus = "PENDING";
    if (action === "accept") targetStatus = "ACCEPTED";
    else if (action === "reject") targetStatus = "REJECTED";
    else if (action === "complete") targetStatus = "COMPLETED";
    else return NextResponse.json({ error: "Invalid modification instruction" }, { status: 400 });

    const alteredBooking = await db.bookings.update({
      where: { id: BigInt(bookingId) },
      data: { status: targetStatus },
    });

    return NextResponse.json(serializeData(alteredBooking), { status: 200 });
  } catch (error) {
    console.error("State modification workflow failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}