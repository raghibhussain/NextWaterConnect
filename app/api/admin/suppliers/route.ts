import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/suppliers?area=Karachi&page=1&limit=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area  = searchParams.get("area");
    const page  = parseInt(searchParams.get("page")  ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip  = (page - 1) * limit;

    // ✅ Build filter
    const filter: any = {};
    if (area) {
      filter.service_area = { contains: area };
    }

    // ✅ Get suppliers with full details
    const [suppliers, totalCount] = await Promise.all([
      db.supplier.findMany({
        where:   filter,
        skip:    skip,
        take:    limit,
        orderBy: { id: "desc" },
        include: {
          user: {
            select: {
              id:    true,
              name:  true,
              email: true,
              phone: true,
              role:  true,
            },
          },
          supplier_type: true,
          bookings: {
            select: {
              id:     true,
              status: true,
            },
          },
          ratings: {
            select: {
              stars: true,
            },
          },
        },
      }),
      db.supplier.count({ where: filter }),
    ]);

    // ✅ Add computed fields
    const enrichedSuppliers = suppliers.map((supplier) => {
      const totalRatings  = supplier.ratings.length;
      const averageRating =
        totalRatings > 0
          ? parseFloat(
              (
                supplier.ratings.reduce(
                  (sum, r) => sum + (r.stars ?? 0), 0
                ) / totalRatings
              ).toFixed(1)
            )
          : 0;

      return {
        ...supplier,
        stats: {
          total_bookings:    supplier.bookings.length,
          completed_bookings: supplier.bookings.filter(
            (b) => b.status === "COMPLETED"
          ).length,
          total_ratings:  totalRatings,
          average_rating: averageRating,
        },
      };
    });

    if (suppliers.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: area
            ? `No suppliers found in area: ${area}`
            : "No suppliers found",
          pagination: {
            total:       0,
            page:        page,
            limit:       limit,
            total_pages: 0,
          },
          suppliers: [],
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
        suppliers: enrichedSuppliers,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Admin suppliers error:", error);
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