import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["TENANT", "LANDLORD"], {
    message: "Role must be either TENANT or LANDLORD",
  }),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().min(6, "Phone must be at least 6 characters").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.phone !== undefined ||
      data.newPassword !== undefined,
    { message: "Provide at least one field to update", path: ["name"] }
  )
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "currentPassword is required to set a new password",
    path: ["currentPassword"],
  });
