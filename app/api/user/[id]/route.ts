import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// GET /api/user/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    // ✅ Validate ID exists
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          message: "User ID is required" 
        },
        { status: 400 }
      );
    }

    // ✅ Validate ID is a number
    if (isNaN(Number(id))) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid User ID format" 
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { 
        id: BigInt(id) // ✅ Use BigInt() instead of parseInt()
      },
      include: {
        consumer: true,  // ✅ Include full profile
        supplier: true,
      },
    });

    // ✅ Return 404 when user not found (not null with 200)
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: `User with ID ${id} not found` 
        },
        { status: 404 }
      );
    }

    // ✅ Serialize BigInt before returning
    return NextResponse.json(
      serializeData({
        success: true,
        user: user,
      }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error fetching user:", error);
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