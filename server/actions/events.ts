"use server";
import { prisma } from "@/lib/prisma";
import { eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { parse } from "path";
import { z } from "zod";

export async function createEvent(
  check: z.infer<typeof eventFormSchema>
): Promise<void> {
  try {
    const { userId } = await auth();
    const parsed = eventFormSchema.safeParse(check);
    if (!parsed.success || !userId) {
      throw new Error("Invalid event data or user not authenticated.");
    }
    //insertion of data
    await prisma.event.create({
      data: {
        ...parsed.data,
        clerkUserId: userId,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to create event: ${error.message || error}`);
  } finally {
    revalidatePath("/events");
  }
}

export async function updateEvent(
  id: string,
  validate: z.infer<typeof eventFormSchema>
): Promise<void> {
  try {
    const {userId} = await auth();
    const parsed = eventFormSchema.safeParse(validate);
    if (!parsed.success || !userId) {
      throw new Error("Invalid event data or user not authenticated.");
    }
    const updated = await prisma.event.updateMany({
      where: {
        id,
        clerkUserId: userId,
      },
      data: {
        ...parsed.data,
      },
    });
    if (updated.count === 0) {
      throw new Error(
        "Event not found or user not authorized to update this event."
      );
    }
  } catch (error: any) {
    throw new Error(`Failed to update event: ${error.message || error}`);
  } finally {
    revalidatePath("/events");
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated.");
    }
    const deletedEvent = await prisma.event.deleteMany({
      where: {
        id,
        clerkUserId: userId,
      },
    });
    if (deletedEvent.count === 0) {
      throw new Error(
        "Event not found or user not authorized to delete this event."
      );
    }
  } catch (error: any) {
    throw new Error(`Failed to delete event: ${error.message || error}`);
  } finally {
    revalidatePath("/events");
  }
}
