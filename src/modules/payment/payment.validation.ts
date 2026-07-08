import { z } from "zod";

export const createPaymentSchema = z.object({
  rentalRequestId: z.uuid("rentalRequestId must be a valid UUID"),
});

export const confirmPaymentSchema = z.object({
  transactionId: z.string().min(1, "transactionId is required"),
});
