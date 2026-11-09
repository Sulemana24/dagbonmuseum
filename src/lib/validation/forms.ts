import { z } from "zod";

export const contactSchema = z.object({
  kind: z.enum(["contact", "visit"]).default("contact"),
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  organization: z.string().trim().max(150).optional(),
  subject: z.string().trim().min(3, "Enter a subject.").max(150),
  message: z.string().trim().min(10, "Write at least 10 characters.").max(4000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree so we can reply to you." }) }),
  website: z.string().max(0).optional(), // honeypot: real users leave this empty
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm you want to subscribe." }) }),
  website: z.string().max(0).optional(),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
