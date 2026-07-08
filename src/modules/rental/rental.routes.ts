import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as rentalController from "./rental.controller";
import {
  createRentalSchema,
  updateRentalStatusSchema,
} from "./rental.validation";

export const rentalRoutes = Router();

rentalRoutes.post(
  "/",
  auth("TENANT"),
  validateRequest(createRentalSchema),
  rentalController.create
);
rentalRoutes.get("/", auth("TENANT"), rentalController.getMine);
rentalRoutes.get("/:id", auth(), rentalController.getById);

export const landlordRentalRoutes = Router();

landlordRentalRoutes.get(
  "/",
  auth("LANDLORD"),
  rentalController.getForLandlord
);
landlordRentalRoutes.patch(
  "/:id/complete",
  auth("LANDLORD"),
  rentalController.complete
);
landlordRentalRoutes.patch(
  "/:id",
  auth("LANDLORD"),
  validateRequest(updateRentalStatusSchema),
  rentalController.updateStatus
);
