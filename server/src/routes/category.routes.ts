import { Router } from "express";
import { getCategories, createCategory, deleteCategory, createCategorySchema } from "../controllers/category.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authenticate);
router.get("/", getCategories);
router.post("/", validate(createCategorySchema), createCategory);
router.delete("/:id", deleteCategory);

export default router;
