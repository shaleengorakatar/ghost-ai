-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "canvasJsonPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectCollaborator" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "public"."Project"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "public"."Project"("ownerId" ASC);

-- CreateIndex
CREATE INDEX "ProjectCollaborator_email_idx" ON "public"."ProjectCollaborator"("email" ASC);

-- CreateIndex
CREATE INDEX "ProjectCollaborator_projectId_createdAt_idx" ON "public"."ProjectCollaborator"("projectId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCollaborator_projectId_email_key" ON "public"."ProjectCollaborator"("projectId" ASC, "email" ASC);

-- AddForeignKey
ALTER TABLE "public"."ProjectCollaborator" ADD CONSTRAINT "ProjectCollaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
