import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

// ✅ Changed from "middleware" to "proxy"
export function proxy(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authorization token required" },
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id",    payload.userId);
    requestHeaders.set("x-user-role",  payload.role);
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/booking/:path*",
    "/api/payment/:path*",
    "/api/rating/:path*",
    "/api/profile/:path*",
  ],
};