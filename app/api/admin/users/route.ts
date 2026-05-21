import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/users
export async function GET() {
  try {
    const nonAdminUsers = await db.user.findMany({
      where: {
        role: {
          not: "ADMIN" // Adjust "role" and "ADMIN" strings to match your schema exact values
        }
      }
    });
    return NextResponse.json(nonAdminUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin users list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}