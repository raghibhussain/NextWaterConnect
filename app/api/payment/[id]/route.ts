import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// ✅ Valid payment status transitions
type PaymentStatus = "PENDING" | "PAID" | "FAILED";

const VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["PAID", "FAILED"],
  PAID:    [],                  // Terminal state
  FAILED:  ["PENDING"],         // Can retry
};

// ==========================================
// GET /api/payment/[id]
// ==========================================
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    // ✅ Validate ID format
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid payment ID format" },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id: BigInt(id) },
      include: {
        consumer: {
          include: {
            user: {
              select: {
                id:    true,
                name:  true,
                email: true,
                phone: true,
              },
            },
          },
        },
        supplier: {
          include: {
            user: {
              select: {
                id:    true,
                name:  true,
                email: true,
                phone: true,
              },
            },
          },
        },
        booking: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: `Payment with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, payment: payment },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT /api/payment/[id]
// Update payment status
// ==========================================
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    // ✅ Validate ID format
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid payment ID format" },
        { status: 400 }
      );
    }

    // ✅ Validate status provided
    if (!body.status) {
      return NextResponse.json(
        { success: false, message: "status field is required" },
        { status: 400 }
      );
    }

    // ✅ Check payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, message: `Payment with ID ${id} not found` },
        { status: 404 }
      );
    }

    const currentStatus = existingPayment.status as PaymentStatus;
    const newStatus     = body.status.toUpperCase() as PaymentStatus;

    // ✅ Validate new status value
    const allValidStatuses: PaymentStatus[] = ["PENDING", "PAID", "FAILED"];
    if (!allValidStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Allowed: ${allValidStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ Validate status transition
    if (currentStatus) {
      const allowedTransitions = VALID_TRANSITIONS[currentStatus] ?? [];
      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot change payment status from "${currentStatus}" to "${newStatus}"`,
            current_status:  currentStatus,
            allowed_next:    allowedTransitions,
          },
          { status: 409 }
        );
      }
    }

    // ✅ Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: BigInt(id) },
      data:  { status: newStatus },
      include: {
        consumer: true,
        supplier: true,
        booking:  true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Payment status updated to ${newStatus}`,
        payment: updatedPayment,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}