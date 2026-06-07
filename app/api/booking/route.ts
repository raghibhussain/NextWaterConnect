import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ No serializeData needed!

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const consumerId = searchParams.get("consumerId");
    const supplierId = searchParams.get("supplierId");
    const body = await request.json();

    if (!consumerId || !supplierId) {
      return NextResponse.json(
        { success: false, message: "consumerId and supplierId are required" },
        { status: 400 }
      );
    }

    if (isNaN(Number(consumerId)) || isNaN(Number(supplierId))) {
      return NextResponse.json(
        { success: false, message: "IDs must be valid numbers" },
        { status: 400 }
      );
    }

    if (!body.booking_date || !body.quantity) {
      return NextResponse.json(
        { success: false, message: "booking_date and quantity are required" },
        { status: 400 }
      );
    }

    const quantity = parseInt(body.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "quantity must be a positive number" },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.booking_date)) {
      return NextResponse.json(
        { success: false, message: "Invalid date format. Use: YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const consumerExists = await db.consumer.findUnique({
      where: { id: BigInt(consumerId) },
    });
    if (!consumerExists) {
      return NextResponse.json(
        { success: false, message: `Consumer with ID ${consumerId} not found` },
        { status: 404 }
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

    const newBooking = await db.bookings.create({
      data: {
        booking_date: String(body.booking_date),
        quantity: quantity,
        status: "PENDING",
        consumer_id: BigInt(consumerId),
        supplier_id: BigInt(supplierId),
      },
      include: { consumer: true, supplier: true },
    });

    // ✅ Return directly!
    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking: newBooking,
      },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}