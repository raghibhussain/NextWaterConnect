import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/rating?consumerId=1&supplierId=2
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const consumerId = searchParams.get("consumerId");
    const supplierId = searchParams.get("supplierId");
    const body = await request.json();

    // ✅ Validate query params
    if (!consumerId || !supplierId) {
      return NextResponse.json(
        {
          success: false,
          message: "consumerId and supplierId are required",
        },
        { status: 400 }
      );
    }

    // ✅ Validate ID formats
    if (isNaN(Number(consumerId)) || isNaN(Number(supplierId))) {
      return NextResponse.json(
        { success: false, message: "IDs must be valid numbers" },
        { status: 400 }
      );
    }

    // ✅ Validate stars field
    if (body.stars === undefined || body.stars === null) {
      return NextResponse.json(
        { success: false, message: "stars field is required" },
        { status: 400 }
      );
    }

    // ✅ Validate stars range (1-5)
    const stars = parseInt(body.stars);
    if (isNaN(stars) || stars < 1 || stars > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "stars must be a number between 1 and 5",
        },
        { status: 400 }
      );
    }

    // ✅ Check consumer exists
    const consumerExists = await db.consumer.findUnique({
      where: { id: BigInt(consumerId) },
    });
    if (!consumerExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Consumer with ID ${consumerId} not found`,
        },
        { status: 404 }
      );
    }

    // ✅ Check supplier exists
    const supplierExists = await db.supplier.findUnique({
      where: { id: BigInt(supplierId) },
    });
    if (!supplierExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Supplier with ID ${supplierId} not found`,
        },
        { status: 404 }
      );
    }

    // ✅ Check consumer has a COMPLETED booking with this supplier
    const completedBooking = await db.bookings.findFirst({
      where: {
        consumer_id: BigInt(consumerId),
        supplier_id: BigInt(supplierId),
        status:      "COMPLETED",
      },
    });

    if (!completedBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only rate a supplier after a COMPLETED booking",
        },
        { status: 403 }
      );
    }

    // ✅ Check if consumer already rated this supplier
    const existingRating = await db.rating.findFirst({
      where: {
        consumer_id: BigInt(consumerId),
        supplier_id: BigInt(supplierId),
      },
    });

    if (existingRating) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already rated this supplier",
          existing_rating: {
            id:      existingRating.id.toString(),
            stars:   existingRating.stars,
            comment: existingRating.comment,
          },
        },
        { status: 409 }
      );
    }

    // ✅ Create rating
    const newRating = await db.rating.create({
      data: {
        stars:       stars,
        comment:     body.comment ? String(body.comment) : null,
        consumer_id: BigInt(consumerId),
        supplier_id: BigInt(supplierId),
      },
      include: {
        consumer: true,
        supplier: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Rating submitted successfully",
        rating:  newRating,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Rating creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:   "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}