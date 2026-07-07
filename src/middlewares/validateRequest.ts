import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import AppError from "../utils/AppError";

const validateRequest = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorDetails = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new AppError(400, "Validation failed", errorDetails));
    }

    req.body = result.data;
    next();
  };
};

export default validateRequest;
