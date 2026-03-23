-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "estimatedMax" DOUBLE PRECISION,
ADD COLUMN     "estimatedMin" DOUBLE PRECISION,
ADD COLUMN     "evaluationNotes" TEXT,
ADD COLUMN     "imageUrl" TEXT;
