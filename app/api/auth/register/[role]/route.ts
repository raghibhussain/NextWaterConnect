import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

interface Params {
  params: Promise<{ role: string }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { role } = await params;
    const body = await request.json();

    // ✅ Hash password INSIDE the function
    const hashedPassword = await hashPassword(body.password);

    // ✅ Validate password exists
    if (!body.password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    // --- CASE 1: Standard User ---
    if (role === "user") {

      // ✅ Validate required fields
      if (!body.email || !body.name) {
        return NextResponse.json(
          { success: false, message: "email and name are required" },
          { status: 400 }
        );
      }

      const newUser = await db.user.create({
        data: {
          email:    body.email,
          name:     body.name,
          password: hashedPassword, // ✅ Use variable not body.hashedPassword
          phone:    body.phone,
          role:     body.role || "USER",
        },
      });

      return NextResponse.json(newUser, { status: 201 });
    }

    // --- CASE 2: Consumer ---
    if (role === "consumer") {

      // ✅ Validate required fields
      if (!body.email || !body.full_name || !body.address) {
        return NextResponse.json(
          { success: false, message: "email, full_name and address are required" },
          { status: 400 }
        );
      }

      const result = await db.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email:    body.email,
            name:     body.full_name,
            password: hashedPassword, // ✅ Use variable
            phone:    body.phone,
            role:     "CONSUMER",
          },
        });

        const newConsumer = await tx.consumer.create({
          data: {
            id:        createdUser.id,
            address:   body.address,
            full_name: body.full_name,
          },
        });

        return { user: createdUser, consumer: newConsumer };
      });

      return NextResponse.json(
        {
          success:  true,
          message:  "Consumer registered successfully",
          user:     result.user,
          consumer: result.consumer,
        },
        { status: 201 }
      );
    }

    // --- CASE 3: Supplier ---
    if (role === "supplier") {

      // ✅ Validate required fields
      if (!body.email || !body.company_name || !body.service_area) {
        return NextResponse.json(
          { success: false, message: "email, company_name and service_area are required" },
          { status: 400 }
        );
      }

      const result = await db.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email:    body.email,
            name:     body.company_name,
            password: hashedPassword, // ✅ Use variable
            phone:    body.phone,
            role:     "SUPPLIER",
          },
        });

        const newSupplier = await tx.supplier.create({
          data: {
            id:           createdUser.id,
            company_name: body.company_name,
            service_area: body.service_area,
          },
        });

        return { user: createdUser, supplier: newSupplier };
      });

      return NextResponse.json(
        {
          success:  true,
          message:  "Supplier registered successfully",
          user:     result.user,
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