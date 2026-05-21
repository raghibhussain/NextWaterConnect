import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/admin/users/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    await db.user.delete({
      where: { id: parseInt(id) }
    });

    return new NextResponse("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}