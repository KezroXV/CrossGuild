-- AlterTable
ALTER TABLE "HeroContent" ADD COLUMN IF NOT EXISTS "primaryButtonUrl" TEXT NOT NULL DEFAULT '#top-selling';
ALTER TABLE "HeroContent" ADD COLUMN IF NOT EXISTS "secondaryButtonUrl" TEXT NOT NULL DEFAULT '#new-arrivals';

-- AlterTable
ALTER TABLE "CategoryHeroContent" ADD COLUMN IF NOT EXISTS "buttonUrl" TEXT NOT NULL DEFAULT '#categories';
