import { NextFunction, Request, Response } from "express";
import * as paymentService from "./payment.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await paymentService.createPayment(
      req.user!.id,
      req.body.rentalRequestId
    );
    res.status(201).json({
      success: true,
      message: "Payment intent created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const confirm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment = await paymentService.confirmPayment(
      req.body.transactionId
    );
    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payments = await paymentService.getMyPayments(req.user!);
    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment = await paymentService.getPaymentById(
      req.params.id as string,
      req.user!
    );
    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
