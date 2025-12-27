/*
  Warnings:

  - You are about to drop the `work_center_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_centers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "work_center_assignments" DROP CONSTRAINT "work_center_assignments_assignedBy_fkey";

-- DropForeignKey
ALTER TABLE "work_center_assignments" DROP CONSTRAINT "work_center_assignments_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "work_center_assignments" DROP CONSTRAINT "work_center_assignments_workCenterId_fkey";

-- DropForeignKey
ALTER TABLE "work_centers" DROP CONSTRAINT "work_centers_companyId_fkey";

-- DropTable
DROP TABLE "work_center_assignments";

-- DropTable
DROP TABLE "work_centers";
