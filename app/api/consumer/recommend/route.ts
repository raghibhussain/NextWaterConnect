import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/consumers/recommend?area=SomeArea
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area");

    if (!area) {
      return NextResponse.json([], { status: 200 });
    }

    const recommended = await db.consumer.findMany({
      where: {
        address: {
          contains: decodeURIComponent(area),
        }
      }
    });

    return NextResponse.json(recommended, { status: 200 });
  } catch (error) {
    console.error("Recommendation fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}