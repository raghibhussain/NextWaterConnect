import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, consumer } from "@prisma/client";

interface Params {
  params: Promise<{ type: string; query: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { type, query } = await params;
    const decodedQuery = decodeURIComponent(query).trim(); 

    let results: (user & { consumer: consumer | null })[] | consumer[] = [];

    if (type === "name") {
      results = await db.user.findMany({
        where: {
          name: {
            contains: decodedQuery // MySQL handles casing based on database collation natively
          },
        },
        include: {
          consumer: true, 
        },
      });
    } else if (type === "address") {
      results = await db.consumer.findMany({
        where: {
          address: {
            contains: decodedQuery
          },
        },
        include: {
          user: true,
        },
      });
    }

    const serializedData = JSON.parse(
      JSON.stringify(results, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serializedData, { status: 200 });
  } catch (error: any) {
    console.error("Consumer join search error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}