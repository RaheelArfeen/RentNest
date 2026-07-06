import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorDetails: err.errorDetails ?? null,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";

  res.status(500).json({
    success: false,
    message,
    errorDetails: err instanceof Error ? err.stack : err,
  });
};

export default errorHandler;
