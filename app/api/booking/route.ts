import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// POST /api/bookings?consumerId=1&supplierId=2
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const consumerId = searchParams.get("consumerId");
    const supplierId = searchParams.get("supplierId");
    const body = await request.json();

    if (!consumerId || !supplierId) {
      return NextResponse.json({ error: "Missing identity queries" }, { status: 400 });
    }

    const newBooking = await db.bookings.create({
      data: {
        booking_date: body.booking_date,
        quantity: parseInt(body.quantity),
        status: body.status || "PENDING",
        consumer_id: BigInt(consumerId),
        supplier_id: BigInt(supplierId),
      },
    });

    return NextResponse.json(serializeData(newBooking), { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}