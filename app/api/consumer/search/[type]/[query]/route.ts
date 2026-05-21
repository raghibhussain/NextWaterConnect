import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ type: string; query: string }>;
}

// GET /api/consumers/search/[type]/[query]
export async function GET(request: Request, { params }: Params) {
  try {
    const { type, query } = await params;
    const decodedQuery = decodeURIComponent(query);

    let consumers = [];

    if (type === "name") {
      consumers = await db.consumer.findMany({
        where: {
          fullName: {
            contains: decodedQuery,
          }
        }
      });
    } else if (type === "address") {
      consumers = await db.consumer.findMany({
        where: {
          address: {
            contains: decodedQuery,
          }
        }
      });
    }

    return NextResponse.json(consumers, { status: 200 });
  } catch (error) {
    console.error("Consumer search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}