-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "listing" ADD COLUMN "locationId" INTEGER;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
