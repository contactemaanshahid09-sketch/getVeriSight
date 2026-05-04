import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name cannot exceed 80 characters."),
  email: z
    .string()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  service: z.enum(
    [
      "General Inquiry",
      "Text Moderation",
      "Image Moderation",
      "Video Moderation",
    ],
    {
      message: "Select a valid service.",
    },
  ),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(2000, "Message cannot exceed 2000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
