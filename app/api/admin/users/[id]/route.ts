import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);

    // ── Delete in strict dependency order (children before parents) ──

    // 1. Ratings (reference consumer_id + supplier_id)
    await db.rating.deleteMany({
      where: { OR: [{ consumer_id: userId }, { supplier_id: userId }] },
    });

    // 2. Payments (reference consumer_id + supplier_id + booking_id)
    await db.payment.deleteMany({
      where: { OR: [{ consumer_id: userId }, { supplier_id: userId }] },
    });

    // 3. Bookings (reference consumer_id + supplier_id)
    await db.bookings.deleteMany({
      where: { OR: [{ consumer_id: userId }, { supplier_id: userId }] },
    });

    // 4. Supplier_type (references supplier_id — must go before supplier)
    await db.supplier_type.deleteMany({
      where: { supplier_id: userId },
    });

    // 5. Consumer / Supplier profile (reference user id)
    await db.consumer.deleteMany({ where: { id: userId } });
    await db.supplier.deleteMany({ where: { id: userId } });

    // 6. Finally delete the base user
    await db.user.delete({ where: { id: userId } });

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}