import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/payments?status=PAID&page=1&limit=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page   = parseInt(searchParams.get("page")  ?? "1");
    const limit  = parseInt(searchParams.get("limit") ?? "10");
    const skip   = (page - 1) * limit;

    // ✅ Validate status if provided
    const VALID_STATUSES = ["PENDING", "PAID", "FAILED"];
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

    // ✅ Get payments with pagination
    const [payments, totalCount] = await Promise.all([
      db.payment.findMany({
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
                },
              },
            },
          },
          booking: true,
        },
      }),
      db.payment.count({ where: filter }),
    ]);

    // ✅ Calculate total for filtered results
    const totalAmount = await db.payment.aggregate({
      where: filter,
      _sum:  { amount: true },
    });

    if (payments.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: status
            ? `No ${status} payments found`
            : "No payments found",
          pagination: {
            total:       0,
            page:        page,
            limit:       limit,
            total_pages: 0,
          },
          total_amount: 0,
          payments:     [],
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
        total_amount: totalAmount._sum.amount ?? 0,
        payments:     payments,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Admin payments error:", error);
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