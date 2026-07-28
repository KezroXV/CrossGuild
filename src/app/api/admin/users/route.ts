import { NextRequest } from "next/server";
import {
  deleteUser,
  listUsers,
  updateUser,
} from "@/features/admin/server/user.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAdmin(async () => {
  try {
    const users = await listUsers();
    return Response.json({ users }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const updatedUser = await updateUser(body);
    return Response.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const { id } = await req.json();
    await deleteUser(id);
    return Response.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
});
