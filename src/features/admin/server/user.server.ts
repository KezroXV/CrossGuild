import prisma from "@/shared/lib/prisma";
import { mapUserFields } from "@/shared/lib/user-fields";
import { ValidationError } from "@/shared/lib/handle-api-error";

export async function listUsers() {
  return prisma.user.findMany({
    include: {
      role: true,
    },
  });
}

export async function updateUser(data: Record<string, unknown>) {
  const mappedUser = mapUserFields(data);

  return prisma.user.update({
    where: { id: mappedUser.id },
    data: mappedUser,
  });
}

export async function deleteUser(id: string) {
  if (!id) {
    throw new ValidationError("User ID is required");
  }

  await prisma.user.delete({
    where: { id },
  });
}
