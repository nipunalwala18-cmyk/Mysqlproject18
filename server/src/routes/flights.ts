import express from "express";
import { getFlights } from "../controllers/flightsController";

const router = express.Router();
router.get("/", getFlights);

export default router;