import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_METHODS = ["cash", "card", "online"];

// POST /api/payment?consumerId=1&supplierId=2&bookingId=1
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const consumerId = searchParams.get("consumerId");
    const supplierId = searchParams.get("supplierId");
    const bookingId  = searchParams.get("bookingId");
    const body = await request.json();

    // ✅ Validate query params
    if (!consumerId || !supplierId || !bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "consumerId, supplierId and bookingId are required",
        },
        { status: 400 }
      );
    }

    // ✅ Validate ID formats
    if (
      isNaN(Number(consumerId)) ||
      isNaN(Number(supplierId)) ||
      isNaN(Number(bookingId))
    ) {
      return NextResponse.json(
        { success: false, message: "IDs must be valid numbers" },
        { status: 400 }
      );
    }

    // ✅ Validate body fields
    if (!body.method || !body.amount) {
      return NextResponse.json(
        { success: false, message: "method and amount are required" },
        { status: 400 }
      );
    }

    // ✅ Validate payment method
    if (!VALID_METHODS.includes(body.method.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid payment method. Allowed: ${VALID_METHODS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ Validate amount
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "amount must be a positive number" },
        { status: 400 }
      );
    }

    // ✅ Check consumer exists
    const consumerExists = await db.consumer.findUnique({
      where: { id: BigInt(consumerId) },
    });
    if (!consumerExists) {
      return NextResponse.json(
        { success: false, message: `Consumer with ID ${consumerId} not found` },
        { status: 404 }
      );
    }

    // ✅ Check supplier exists
    const supplierExists = await db.supplier.findUnique({
      where: { id: BigInt(supplierId) },
    });
    if (!supplierExists) {
      return NextResponse.json(
        { success: false, message: `Supplier with ID ${supplierId} not found` },
        { status: 404 }
      );
    }

    // ✅ Check booking exists
    const bookingExists = await db.bookings.findUnique({
      where: { id: BigInt(bookingId) },
    });
    if (!bookingExists) {
      return NextResponse.json(
        { success: false, message: `Booking with ID ${bookingId} not found` },
        { status: 404 }
      );
    }

    // ✅ Check booking is ACCEPTED before payment
    if (bookingExists.status !== "ACCEPTED") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment can only be made for ACCEPTED bookings. Current status: ${bookingExists.status}`,
        },
        { status: 409 }
      );
    }

    // ✅ Check payment doesn't already exist for this booking
    const existingPayment = await db.payment.findUnique({
      where: { booking_id: BigInt(bookingId) },
    });
    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment already exists for this booking",
          existing_payment_id: existingPayment.id.toString(),
        },
        { status: 409 }
      );
    }

    // ✅ Create payment
    const newPayment = await db.payment.create({
      data: {
        method:      body.method.toLowerCase(),
        amount:      amount,
        status:      "PENDING",
        consumer_id: BigInt(consumerId),
        supplier_id: BigInt(supplierId),
        booking_id:  BigInt(bookingId),
      },
      include: {
        consumer: true,
        supplier: true,
        booking:  true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment created successfully",
        payment: newPayment,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}