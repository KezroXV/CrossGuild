-- CreateTable
CREATE TABLE "CategoryHeroContent" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "highlightedText" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "backgroundImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryHeroContent_pkey" PRIMARY KEY ("id")
);

-- Drop duplicate FAQ model
DROP TABLE IF EXISTS "fAQ";
