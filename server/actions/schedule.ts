'use server'

import { fromZonedTime } from "date-fns-tz"
import { prisma } from "@/lib/prisma"
import { scheduleFormSchema } from "@/schema/schedule"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  addMinutes,
  areIntervalsOverlapping,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns"
import { day } from "@/app/generated/prisma"
import { Prisma } from "@/app/generated/prisma"
import { getCalendarEventTimes } from "../google/googleCalender"

type FullSchedule = Prisma.ScheduleGetPayload<{
  include: { availabilities: true }
}>

export async function getSchedule(userId: string): Promise<FullSchedule | null> {
  return prisma.schedule.findUnique({
    where: { clerkUserId: userId },
    include: { availabilities: true },
  })
}

export async function saveSchedule(unsafeData: z.infer<typeof scheduleFormSchema>) {
  try {
    const { userId } = await auth()
    const { success, data } = scheduleFormSchema.safeParse(unsafeData)

    if (!success || !userId) {
      throw new Error("Invalid schedule data or user not authenticated.")
    }

    const { availabilities, ...scheduleData } = data

    const schedule = await prisma.schedule.upsert({
      where: { clerkUserId: userId },
      update: scheduleData,
      create: { ...scheduleData, clerkUserId: userId, timeZone: scheduleData.timezone },
    })

    await prisma.$transaction([
      prisma.scheduleAvailability.deleteMany({
        where: { scheduleId: schedule.id },
      }),
      ...(availabilities.length > 0
        ? [
            prisma.scheduleAvailability.createMany({
              data: availabilities.map((a) => ({
                ...a,
                dayOfWeek: a.dayOfWeek.toUpperCase() as day, // ✅ FIXED
                scheduleId: schedule.id,
              })),
            }),
          ]
        : []),
    ])
  } catch (error: any) {
    throw new Error(`Failed to save schedule: ${error.message || error}`)
  } finally {
    revalidatePath("/schedule")
  }
}

export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number }
): Promise<Date[]> {
  const { clerkUserId: userId, durationInMinutes } = event
  const start = timesInOrder[0]
  const end = timesInOrder.at(-1)
  if (!start || !end) return []

  const schedule = await getSchedule(userId)
  if (schedule == null) return []

  const groupedAvailabilities = Object.groupBy(
    schedule.availabilities,
    (a) => a.dayOfWeek
  )

  // const eventTimes = await getCalendarEventTimes(userId, { start, end })

  return timesInOrder.filter((intervalDate) => {
    const availabilities = getAvailabilities(
      groupedAvailabilities,
      intervalDate,
      schedule.timeZone
    )
    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, durationInMinutes),
    }
    return (
      // eventTimes.every(
      //   (eventTime: { start: Date; end: Date }) =>
      //     !areIntervalsOverlapping(eventTime, eventInterval)
      // ) &&
      availabilities.some(
        (availability) =>
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
      )
    )
  })
}

function getAvailabilities(
  groupedAvailabilities: Partial<Record<day, any[]>>,
  date: Date,
  timezone: string
): { start: Date; end: Date }[] {
  const dayOfWeek = (() => {
    if (isMonday(date)) return day.MONDAY
    if (isTuesday(date)) return day.TUESDAY
    if (isWednesday(date)) return day.WEDNESDAY
    if (isThursday(date)) return day.THURSDAY
    if (isFriday(date)) return day.FRIDAY
    if (isSaturday(date)) return day.SATURDAY
    if (isSunday(date)) return day.SUNDAY
    return null
  })()
  if (!dayOfWeek) return []

  const dayAvailabilities = groupedAvailabilities[dayOfWeek]
  if (!dayAvailabilities) return []

  return dayAvailabilities.map(({ startTime, endTime }) => {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)
    const start = fromZonedTime(
      setMinutes(setHours(date, startHour), startMinute),
      timezone
    )
    const end = fromZonedTime(
      setMinutes(setHours(date, endHour), endMinute),
      timezone
    )
    return { start, end }
  })
}
