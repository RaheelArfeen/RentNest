import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import * as categoryController from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();

router.get("/", categoryController.getAll);
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(createCategorySchema),
  categoryController.create
);
router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(updateCategorySchema),
  categoryController.update
);
router.delete("/:id", auth("ADMIN"), categoryController.remove);

export default router;
