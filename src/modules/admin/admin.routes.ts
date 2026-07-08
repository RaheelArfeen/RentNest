import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as adminController from "./admin.controller";
import { updateUserStatusSchema } from "./admin.validation";

const router = Router();

router.get("/users", auth("ADMIN"), adminController.getUsers);
router.get("/properties", auth("ADMIN"), adminController.getProperties);
router.get("/rentals", auth("ADMIN"), adminController.getRentals);
router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus
);

export default router;
