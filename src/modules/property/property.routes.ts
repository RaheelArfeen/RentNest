import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as propertyController from "./property.controller";
import {
  createPropertySchema,
  updatePropertySchema,
} from "./property.validation";

export const publicPropertyRoutes = Router();

publicPropertyRoutes.get("/", propertyController.getAll);
publicPropertyRoutes.get("/:id", propertyController.getById);

export const landlordPropertyRoutes = Router();

landlordPropertyRoutes.post(
  "/",
  auth("LANDLORD"),
  validateRequest(createPropertySchema),
  propertyController.create
);
landlordPropertyRoutes.put(
  "/:id",
  auth("LANDLORD"),
  validateRequest(updatePropertySchema),
  propertyController.update
);
landlordPropertyRoutes.delete(
  "/:id",
  auth("LANDLORD"),
  propertyController.remove
);
