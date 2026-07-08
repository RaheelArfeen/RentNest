import { NextFunction, Request, Response } from "express";
import * as reviewService from "./review.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await reviewService.createReview(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
