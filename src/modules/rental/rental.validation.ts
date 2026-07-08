import { z } from "zod";

export const createRentalSchema = z
  .object({
    propertyId: z.uuid("propertyId must be a valid UUID"),
    startDate: z.coerce.date({ message: "startDate must be a valid date" }),
    endDate: z.coerce.date({ message: "endDate must be a valid date" }),
    message: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  })
  .refine((data) => data.startDate >= new Date(new Date().toDateString()), {
    message: "startDate cannot be in the past",
    path: ["startDate"],
  });

export const updateRentalStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    message: "Status must be either APPROVED or REJECTED",
  }),
});
