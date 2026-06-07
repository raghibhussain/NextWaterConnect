import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/bookings?status=PENDING&page=1&limit=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page   = parseInt(searchParams.get("page")  ?? "1");
    const limit  = parseInt(searchParams.get("limit") ?? "10");
    const skip   = (page - 1) * limit;

    // ✅ Validate status if provided
    const VALID_STATUSES = ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED"];
    if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ Build filter
    const filter: any = {};
    if (status) {
      filter.status = status.toUpperCase();
    }

    // ✅ Get bookings with pagination
    const [bookings, totalCount] = await Promise.all([
      db.bookings.findMany({
        where:   filter,
        skip:    skip,
        take:    limit,
        orderBy: { id: "desc" },
        include: {
          consumer: {
            include: {
              user: {
                select: {
                  id:    true,
                  name:  true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          supplier: {
            include: {
              user: {
                select: {
                  id:    true,
                  name:  true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          payment: true,
        },
      }),
      db.bookings.count({ where: filter }),
    ]);

    // ✅ Handle no results
    if (bookings.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: status
            ? `No ${status} bookings found`
            : "No bookings found",
          pagination: {
            total:        0,
            page:         page,
            limit:        limit,
            total_pages:  0,
          },
          bookings: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        pagination: {
          total:       totalCount,
          page:        page,
          limit:       limit,
          total_pages: Math.ceil(totalCount / limit),
        },
        bookings: bookings,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Admin bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        error:   "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}