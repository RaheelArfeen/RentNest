import { NextFunction, Request, Response } from "express";
import * as propertyService from "./property.service";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      categoryId,
      searchTerm,
      isAvailable,
      page,
      limit,
    } = req.query;

    const result = await propertyService.getAllProperties({
      location: location as string | undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      categoryId: categoryId as string | undefined,
      searchTerm: searchTerm as string | undefined,
      isAvailable:
        isAvailable !== undefined ? isAvailable === "true" : undefined,
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(50, Math.max(1, Number(limit) || 10)),
    });

    res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      meta: result.meta,
      data: result.properties,
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
    const property = await propertyService.getPropertyById(
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: "Property fetched successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const property = await propertyService.createProperty(
      req.user!.id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const property = await propertyService.updateProperty(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await propertyService.deleteProperty(
      req.params.id as string,
      req.user!.id
    );
    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
