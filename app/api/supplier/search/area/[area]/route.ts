import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ area: string }>;
}

// GET /api/suppliers/search/area/[area]
export async function GET(request: Request, { params }: Params) {
  try {
    const { area } = await params;
    
    const suppliers = await db.supplier.findMany({
      where: {
        service_area: {
          contains: decodeURIComponent(area),
        }
      }
    });

    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Supplier search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}