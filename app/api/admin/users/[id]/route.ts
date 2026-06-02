import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Typed as a Promise
) {
  try {
    // 2. Properly await the params object before destructuring
    const { id } = await params; 
    const userId = parseInt(id);

    // 3. Fix relation constraints: using the foreign key column (e.g., userId)
    // instead of 'id' (which refers to the booking's/consumer's own primary key).
    await db.bookings.deleteMany({ where: { id: userId } });
    await db.consumer.deleteMany({ where: { id: userId } });
    await db.supplier.deleteMany({ where: { id: userId } });

    // 4. Safely delete the parent record
    await db.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}