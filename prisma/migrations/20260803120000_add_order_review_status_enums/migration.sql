-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable: migrate Order.status from TEXT to OrderStatus
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING (
  CASE LOWER("status")
    WHEN 'pending' THEN 'pending'::"OrderStatus"
    WHEN 'processing' THEN 'processing'::"OrderStatus"
    WHEN 'shipped' THEN 'shipped'::"OrderStatus"
    WHEN 'delivered' THEN 'delivered'::"OrderStatus"
    WHEN 'cancelled' THEN 'cancelled'::"OrderStatus"
    WHEN 'canceled' THEN 'cancelled'::"OrderStatus"
    WHEN 'returned' THEN 'cancelled'::"OrderStatus"
    ELSE 'pending'::"OrderStatus"
  END
);
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable: add Review.status
ALTER TABLE "Review" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'pending';

-- Existing reviews were publicly visible — mark as approved
UPDATE "Review" SET "status" = 'approved';

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Item_slug_idx" ON "Item"("slug");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_brandId_idx" ON "Item"("brandId");

-- CreateIndex
CREATE INDEX "Review_itemId_idx" ON "Review"("itemId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_itemId_idx" ON "CartItem"("itemId");
