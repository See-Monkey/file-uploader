/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `ShareLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_fileId_key" ON "ShareLink"("fileId");
