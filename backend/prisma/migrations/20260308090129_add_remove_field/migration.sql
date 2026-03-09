/*
  Warnings:

  - You are about to drop the column `profile` on the `Job_Apps` table. All the data in the column will be lost.
  - Added the required column `job_desc` to the `Job_Apps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job_Apps" DROP COLUMN "profile",
ADD COLUMN     "job_desc" TEXT NOT NULL;
