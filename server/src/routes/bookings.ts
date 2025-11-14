import express from "express";
import {
  bookFlight,
  getUserBookings,
  cancelBooking,
} from "../controllers/bookingsController";

const router = express.Router();

router.post("/", bookFlight);
router.get("/:userId", getUserBookings);
router.delete("/:id", cancelBooking);

export default router;