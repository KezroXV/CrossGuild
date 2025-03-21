import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const types = await prisma.productType.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(types);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = await prisma.productType.create({
      data: {
        name: body.name,
        hasInput: body.hasInput || false,
      },
    });
    return NextResponse.json(type);
  } catch (error) {
    return NextResponse.json({ error: "Error creating type" }, { status: 500 });
  }
}
