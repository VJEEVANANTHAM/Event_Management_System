import express from "express";
const router = express.Router();
import {
  createProfile,
  listProfiles,
  updateProfile,
} from "../controllers/profileController.js";

router.post("/", createProfile);
router.get("/", listProfiles);
router.put("/:id", updateProfile);

export default router;
