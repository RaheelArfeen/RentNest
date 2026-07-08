import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as reviewController from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth("TENANT"),
  validateRequest(createReviewSchema),
  reviewController.create
);

export default router;
