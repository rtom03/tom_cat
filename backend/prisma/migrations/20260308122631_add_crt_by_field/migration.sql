/*
  Warnings:

  - Added the required column `createdById` to the `Job_Apps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job_Apps" ADD COLUMN     "createdById" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Job_Apps" ADD CONSTRAINT "Job_Apps_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
