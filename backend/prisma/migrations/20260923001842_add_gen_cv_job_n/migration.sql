/*
  Warnings:

  - The `generatedCv` column on the `Job_Apps` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Job_Apps" DROP COLUMN "generatedCv",
ADD COLUMN     "generatedCv" JSONB;
