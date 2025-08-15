import { describe } from "node:test";
import { z } from "zod";
import { de } from "zod/locales";

export const eventFormSchema = z.object({
  name: z.string().min(1, { message: "Event name is required" }),
  description: z.string().optional(),
  isActive: z.boolean(),
  durationInMinutes: z
    .number()
    .int()
    .positive("Duration must be greater than 0")
    .max(60 * 12, `Duration must be less than 12 hours (${60 * 12} minutes)`),
});
