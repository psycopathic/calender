-- CreateEnum
CREATE TYPE "public"."day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationInMinutes" INTEGER NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduleAvailability" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "dayOfWeek" "public"."day" NOT NULL,

    CONSTRAINT "ScheduleAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clerkUserIdIndex" ON "public"."Event"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_clerkUserId_key" ON "public"."Schedule"("clerkUserId");

-- CreateIndex
CREATE INDEX "scheduleIdIndex" ON "public"."ScheduleAvailability"("scheduleId");

-- AddForeignKey
ALTER TABLE "public"."ScheduleAvailability" ADD CONSTRAINT "ScheduleAvailability_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
