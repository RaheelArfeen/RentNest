import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as paymentController from "./payment.controller";
import {
  confirmPaymentSchema,
  createPaymentSchema,
} from "./payment.validation";

const router = Router();

router.post(
  "/create",
  auth("TENANT"),
  validateRequest(createPaymentSchema),
  paymentController.create
);
router.post(
  "/confirm",
  auth(),
  validateRequest(confirmPaymentSchema),
  paymentController.confirm
);
router.get("/", auth(), paymentController.getMine);
router.get("/:id", auth(), paymentController.getById);

export default router;
