import { NextFunction, Request, Response } from "express";
import * as rentalService from "./rental.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = await rentalService.createRentalRequest(
      req.user!.id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Rental request submitted successfully",
      data: request,
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
    const requests = await rentalService.getMyRentalRequests(req.user!.id);
    res.status(200).json({
      success: true,
      message: "Rental requests fetched successfully",
      data: requests,
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
    const request = await rentalService.getRentalRequestById(
      req.params.id as string,
      req.user!
    );
    res.status(200).json({
      success: true,
      message: "Rental request fetched successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getForLandlord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await rentalService.getLandlordRentalRequests(
      req.user!.id
    );
    res.status(200).json({
      success: true,
      message: "Rental requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const complete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = await rentalService.completeRental(
      req.params.id as string,
      req.user!.id
    );
    res.status(200).json({
      success: true,
      message: "Rental marked as completed successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = await rentalService.updateRentalStatus(
      req.params.id as string,
      req.user!.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: `Rental request ${request.status.toLowerCase()} successfully`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
