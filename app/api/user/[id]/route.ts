import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    const user = await db.user.findUnique({
      where: { id: parseInt(id) }, 
    });

    if (!user) {
      return NextResponse.json(null, { status: 200 }); 
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}