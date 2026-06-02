import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ type: string; id: string }>;
}

function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// GET /api/bookings/lookup/[type]/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const { type, id } = await params;
    let list = [];

    if (type === "consumer") {
      list = await db.bookings.findMany({
        where: { consumer_id: BigInt(id) },
        include: { supplier: true },
      });
    } else if (type === "supplier") {
      list = await db.bookings.findMany({
        where: { supplier_id: BigInt(id) },
        include: { consumer: true },
      });
    } else {
      return NextResponse.json({ error: "Invalid entity scope target" }, { status: 400 });
    }

    return NextResponse.json(serializeData(list), { status: 200 });
  } catch (error) {
    console.error("Booking lookup workflow failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}