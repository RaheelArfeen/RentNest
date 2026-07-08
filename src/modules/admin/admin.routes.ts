import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as adminController from "./admin.controller";
import { updateUserStatusSchema } from "./admin.validation";

const router = Router();

router.get("/users", auth("ADMIN"), adminController.getUsers);
router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus
);

export default router;
