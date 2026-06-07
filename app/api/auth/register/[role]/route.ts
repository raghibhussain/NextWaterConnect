import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ role: string }>;
}

// ✅ No serializeData needed!

export async function POST(request: Request, { params }: Params) {
  try {
    const { role } = await params;
    const body = await request.json();

    if (role === "user") {
      const newUser = await db.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: body.password,
          phone: body.phone,
          role: body.role || "USER",
        },
      });

      // ✅ Return directly!
      return NextResponse.json(newUser, { status: 201 });
    }

    if (role === "consumer") {
      const result = await db.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: body.email,
            name: body.full_name,
            password: body.password,
            phone: body.phone,
            role: "CONSUMER",
          },
        });
        const newConsumer = await tx.consumer.create({
          data: {
            id: createdUser.id,
            address: body.address,
            full_name: body.full_name,
          },
        });
        return { user: createdUser, consumer: newConsumer };
      });

      // ✅ Return directly!
      return NextResponse.json(
        {
          success: true,
          message: "Consumer registered successfully",
          user: result.user,
          consumer: result.consumer,
        },
        { status: 201 }
      );
    }

    if (role === "supplier") {
      const result = await db.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: body.email,
            name: body.company_name,
            password: body.password,
            phone: body.phone,
            role: "SUPPLIER",
          },
        });
        const newSupplier = await tx.supplier.create({
          data: {
            id: createdUser.id,
            company_name: body.company_name,
            service_area: body.service_area,
          },
        });
        return { user: createdUser, supplier: newSupplier };
      });

      // ✅ Return directly!
      return NextResponse.json(
        {
          success: true,
          message: "Supplier registered successfully",
          user: result.user,
          supplier: result.supplier,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid registration role" },
      { status: 400 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Registration failed", details: error.message },
      { status: 500 }
    );
  }
}