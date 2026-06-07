import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/dashboard
// Returns complete system statistics
export async function GET(request: Request) {
  try {

    // ✅ Run all queries in parallel for speed
    const [
      totalUsers,
      totalConsumers,
      totalSuppliers,
      totalBookings,
      totalPayments,
      totalRatings,
      pendingBookings,
      acceptedBookings,
      completedBookings,
      rejectedBookings,
      pendingPayments,
      paidPayments,
      failedPayments,
      recentBookings,
      recentPayments,
    ] = await Promise.all([
      // User counts
      db.user.count(),
      db.consumer.count(),
      db.supplier.count(),

      // Booking counts
      db.bookings.count(),
      db.payment.count(),
      db.rating.count(),

      // Booking status counts
      db.bookings.count({ where: { status: "PENDING" } }),
      db.bookings.count({ where: { status: "ACCEPTED" } }),
      db.bookings.count({ where: { status: "COMPLETED" } }),
      db.bookings.count({ where: { status: "REJECTED" } }),

      // Payment status counts
      db.payment.count({ where: { status: "PENDING" } }),
      db.payment.count({ where: { status: "PAID" } }),
      db.payment.count({ where: { status: "FAILED" } }),

      // Recent bookings (last 5)
      db.bookings.findMany({
        take: 5,
        orderBy: { id: "desc" },
        include: {
          consumer: {
            include: {
              user: {
                select: {
                  name:  true,
                  email: true,
                },
              },
            },
          },
          supplier: {
            include: {
              user: {
                select: {
                  name:  true,
                  email: true,
                },
              },
            },
          },
        },
      }),

      // Recent payments (last 5)
      db.payment.findMany({
        take: 5,
        orderBy: { id: "desc" },
        include: {
          consumer: {
            include: {
              user: {
                select: {
                  name:  true,
                  email: true,
                },
              },
            },
          },
          supplier: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // ✅ Calculate total revenue (sum of all PAID payments)
    const revenueResult = await db.payment.aggregate({
      where:  { status: "PAID" },
      _sum:   { amount: true },
      _avg:   { amount: true },
      _max:   { amount: true },
      _min:   { amount: true },
    });

    // ✅ Calculate average rating across all suppliers
    const ratingResult = await db.rating.aggregate({
      _avg: { stars: true },
      _count: { stars: true },
    });

    return NextResponse.json(
      {
        success: true,
        dashboard: {

          // 👥 User Statistics
          users: {
            total:     totalUsers,
            consumers: totalConsumers,
            suppliers: totalSuppliers,
          },

          // 📅 Booking Statistics
          bookings: {
            total:     totalBookings,
            pending:   pendingBookings,
            accepted:  acceptedBookings,
            completed: completedBookings,
            rejected:  rejectedBookings,
          },

          // 💳 Payment Statistics
          payments: {
            total:   totalPayments,
            pending: pendingPayments,
            paid:    paidPayments,
            failed:  failedPayments,
          },

          // 💰 Revenue Statistics
          revenue: {
            total:   revenueResult._sum.amount   ?? 0,
            average: revenueResult._avg.amount   ?? 0,
            highest: revenueResult._max.amount   ?? 0,
            lowest:  revenueResult._min.amount   ?? 0,
          },

          // ⭐ Rating Statistics
          ratings: {
            total:   totalRatings,
            average: parseFloat(
              (ratingResult._avg.stars ?? 0).toFixed(1)
            ),
          },

          // 🕐 Recent Activity
          recent: {
            bookings: recentBookings,
            payments: recentPayments,
          },
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Dashboard stats error:", error);
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