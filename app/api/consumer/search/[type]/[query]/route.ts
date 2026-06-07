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

    // Validate empty query
    if (!decodedQuery) {
      return NextResponse.json(
        { error: "Search query cannot be empty" },
        { status: 400 }
      );
    }

    // Validate search type
    if (!["name", "address"].includes(type)) {
      return NextResponse.json(
        { error: `Invalid search type "${type}". Allowed: name, address` },
        { status: 400 }
      );
    }

    let results: any[] = [];
    let totalFound = 0;

    if (type === "name") {
      results = await db.user.findMany({
        where: {
          name: {
            contains: decodedQuery,
          },
          // ✅ NEW: Only return users WHO HAVE a consumer profile
          consumer: {
            isNot: null,
          },
        },
        include: {
          consumer: true,
        },
      });

      totalFound = results.length;

      // ✅ Warn about users found but missing consumer profile
      // (for debugging only - remove in production)
      const allUsersWithName = await db.user.findMany({
        where: { name: { contains: decodedQuery } },
        select: { id: true, name: true, role: true },
      });

      const orphanedUsers = allUsersWithName.filter(
        (u) => !results.find((r) => r.id === u.id)
      );

      if (orphanedUsers.length > 0) {
        console.warn(
          "⚠️ Users found without consumer profiles:",
          orphanedUsers
        );
      }

    } else if (type === "address") {
      results = await db.consumer.findMany({
        where: {
          address: {
            contains: decodedQuery,
          },
        },
        include: {
          user: true,
        },
      });

      totalFound = results.length;
    }

    // ✅ Handle no results
    if (totalFound === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `No consumers found for ${type}: "${decodedQuery}"`,
          total: 0,
          data: [],
        },
        { status: 200 }
      );
    }

    // ✅ Serialize BigInt
    const serializedData = JSON.parse(
      JSON.stringify(results, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(
      {
        success: true,
        total: totalFound,
        data: serializedData,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Consumer search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}