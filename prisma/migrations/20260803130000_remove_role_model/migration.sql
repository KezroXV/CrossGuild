-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "roleId";

-- DropTable
DROP TABLE IF EXISTS "Role";
