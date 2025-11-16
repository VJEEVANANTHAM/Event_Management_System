import express from "express";
const router = express.Router();
import {
  createEvent,
  listEventsForProfile,
  updateEvent,
  getEventLogs,
} from "../controllers/eventController.js";

router.post("/", createEvent);
router.get("/profile/:profileId", listEventsForProfile);
router.put("/:eventId", updateEvent);
router.get("/:eventId/logs", getEventLogs);

export default router;
