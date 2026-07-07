import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  price: z.number().positive("Price must be a positive number"),
  categoryId: z.uuid("categoryId must be a valid UUID"),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.url("Each image must be a valid URL")).optional().default([]),
});

export const updatePropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  location: z.string().min(2, "Location is required").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  categoryId: z.uuid("categoryId must be a valid UUID").optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.url("Each image must be a valid URL")).optional(),
  isAvailable: z.boolean().optional(),
});
