/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const roles = await prisma.role.findMany();
    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve roles" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { name, permissions } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name,
        permissions: permissions || [],
      },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, permissions } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "Role ID and name are required" },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: permissions || [],
      },
    });

    return NextResponse.json({ role }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
