import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { Prisma } from "../generated/prisma/client";
import AppError from "../utils/AppError";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Errors thrown intentionally by the application
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorDetails: err.errorDetails ?? null,
    });
    return;
  }

  // Malformed JSON in the request body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
      errorDetails: err.message,
    });
    return;
  }

  // Known Prisma errors (bad foreign keys, duplicates, missing records)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with this value already exists",
        errorDetails: { fields: err.meta?.target ?? null },
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "The requested record was not found",
        errorDetails: null,
      });
      return;
    }

    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        message: "Invalid reference to a related record",
        errorDetails: { field: err.meta?.field_name ?? null },
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Database request failed",
      errorDetails: { code: err.code },
    });
    return;
  }

  // Invalid data shape reaching Prisma (e.g. malformed UUID)
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: "Invalid data provided for this operation",
      errorDetails: null,
    });
    return;
  }

  // Stripe API errors
  if (err instanceof Stripe.errors.StripeError) {
    res.status(err.statusCode ?? 400).json({
      success: false,
      message: `Payment provider error: ${err.message}`,
      errorDetails: { type: err.type, code: err.code ?? null },
    });
    return;
  }

  // Anything unexpected
  console.error("Unhandled error:", err);

  const isProduction = process.env.NODE_ENV === "production";
  const message = err instanceof Error ? err.message : "Internal Server Error";

  res.status(500).json({
    success: false,
    message: isProduction ? "Internal Server Error" : message,
    errorDetails:
      isProduction ? null : err instanceof Error ? err.stack : String(err),
  });
};

export default errorHandler;
