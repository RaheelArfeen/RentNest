import { z } from "zod";

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BANNED"], {
    message: "Status must be either ACTIVE or BANNED",
  }),
});
