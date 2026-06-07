import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ bookingId: string; action: string }>;
}


// ✅ Strongly typed status
type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";

// ✅ Valid actions mapped to target statuses
const ACTION_MAP: Record<string, BookingStatus> = {
  accept:   "ACCEPTED",
  reject:   "REJECTED",
  complete: "COMPLETED",
};

// ✅ Transition rules with strong typing
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:   ["ACCEPTED", "REJECTED"],
  ACCEPTED:  ["COMPLETED"],
  REJECTED:  [],
  COMPLETED: [],
};

// PUT /api/booking/[bookingId]/[action]?supplierId=XX
export async function PUT(request: Request, { params }: Params) {
  try {
    const { bookingId, action } = await params;
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    // ✅ Validate bookingId format
    if (!bookingId || isNaN(Number(bookingId))) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    // ✅ Validate supplierId
    if (!supplierId || isNaN(Number(supplierId))) {
      return NextResponse.json(
        { success: false, message: "Valid supplier ID is required" },
        { status: 400 }
      );
    }

    // ✅ Validate action BEFORE hitting database
    if (!ACTION_MAP[action]) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid action "${action}". Allowed: ${Object.keys(ACTION_MAP).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Fetch current booking
    const currentBooking = await db.bookings.findUnique({
      where: { id: BigInt(bookingId) },
    });

    if (!currentBooking) {
      return NextResponse.json(
        { success: false, message: `Booking with ID ${bookingId} not found` },
        { status: 404 }
      );
    }

    // ✅ Verify supplier ownership
    if (currentBooking.supplier_id !== BigInt(supplierId)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: You do not own this booking" },
        { status: 403 }
      );
    }

    const targetStatus = ACTION_MAP[action];
    const currentStatus = currentBooking.status;

    // ✅ Handle null/undefined status safely
    if (!currentStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking has an invalid status. Please contact support.",
        },
        { status: 409 }
      );
    }

    // ✅ Cast to BookingStatus after null check
    const typedCurrentStatus = currentStatus as BookingStatus;

    // ✅ Validate status transition
    const allowedNextStatuses = VALID_TRANSITIONS[typedCurrentStatus] ?? [];
    if (!allowedNextStatuses.includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot "${action}" a booking that is currently "${currentStatus}".`,
          current_status: currentStatus,
          allowed_actions: allowedNextStatuses,
        },
        { status: 409 }
      );
    }

    // ✅ Perform status update
    const updatedBooking = await db.bookings.update({
      where: { id: BigInt(bookingId) },
      data: { status: targetStatus },
    });

    return NextResponse.json({
        success: true,
        message: `Booking ${action}ed successfully`,
        booking: updatedBooking,
    },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Booking action error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal Server Error", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}