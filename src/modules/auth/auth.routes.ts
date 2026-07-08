import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as authController from "./auth.controller";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.get("/me", auth(), authController.me);
router.patch(
  "/me",
  auth(),
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

export default router;
