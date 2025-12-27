-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "companyName" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
