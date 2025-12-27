/*
  Warnings:

  - The values [COMPLETED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP', 'CANCELLED');
ALTER TABLE "maintenance_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "maintenance_requests" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "maintenance_requests" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "assignedTechnicianId" TEXT,
ADD COLUMN     "defaultMaintenanceTeamId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "warrantyInfo" TEXT;

-- AlterTable
ALTER TABLE "maintenance_requests" ADD COLUMN     "assignedTechnicianId" TEXT;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_assignedTechnicianId_fkey" FOREIGN KEY ("assignedTechnicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_defaultMaintenanceTeamId_fkey" FOREIGN KEY ("defaultMaintenanceTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assignedTechnicianId_fkey" FOREIGN KEY ("assignedTechnicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
