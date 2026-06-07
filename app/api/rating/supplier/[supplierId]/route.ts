import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ supplierId: string }>;
}

// GET /api/rating/supplier/[supplierId]
// Returns all ratings + average for a supplier
export async function GET(request: Request, { params }: Params) {
  try {
    const { supplierId } = await params;

    // ✅ Validate ID format
    if (!supplierId || isNaN(Number(supplierId))) {
      return NextResponse.json(
        { success: false, message: "Invalid supplier ID format" },
        { status: 400 }
      );
    }

    // ✅ Check supplier exists
    const supplierExists = await db.supplier.findUnique({
      where: { id: BigInt(supplierId) },
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
    });

    if (!supplierExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Supplier with ID ${supplierId} not found`,
        },
        { status: 404 }
      );
    }

    // ✅ Get all ratings for supplier
    const ratings = await db.rating.findMany({
      where: { supplier_id: BigInt(supplierId) },
      include: {
        consumer: {
          include: {
            user: {
              select: {
                id:   true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" }, // Most recent first
    });

    // ✅ Calculate average rating
    const totalRatings = ratings.length;
    const averageStars =
      totalRatings > 0
        ? parseFloat(
            (
              ratings.reduce((sum, r) => sum + (r.stars ?? 0), 0) /
              totalRatings
            ).toFixed(1)
          )
        : 0;

    // ✅ Calculate star distribution
    const starDistribution = {
      5: ratings.filter((r) => r.stars === 5).length,
      4: ratings.filter((r) => r.stars === 4).length,
      3: ratings.filter((r) => r.stars === 3).length,
      2: ratings.filter((r) => r.stars === 2).length,
      1: ratings.filter((r) => r.stars === 1).length,
    };

    // ✅ Handle no ratings
    if (totalRatings === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No ratings found for this supplier",
          supplier: {
            id:           supplierId,
            company_name: supplierExists.company_name,
            user:         supplierExists.user,
          },
          summary: {
            total_ratings:    0,
            average_stars:    0,
            star_distribution: starDistribution,
          },
          ratings: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        supplier: {
          id:           supplierId,
          company_name: supplierExists.company_name,
          user:         supplierExists.user,
        },
        summary: {
          total_ratings:     totalRatings,
          average_stars:     averageStars,
          star_distribution: starDistribution,
        },
        ratings: ratings,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get ratings error:", error);
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