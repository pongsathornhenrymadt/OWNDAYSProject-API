/*
  Warnings:

  - You are about to drop the `AddOn` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AddOn" DROP CONSTRAINT "AddOn_productId_fkey";

-- DropTable
DROP TABLE "public"."AddOn";

-- CreateTable
CREATE TABLE "public"."AddOns" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "AddOns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AddOns" ADD CONSTRAINT "AddOns_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
