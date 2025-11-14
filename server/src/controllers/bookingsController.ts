import { db } from "../config/db";
import { Request, Response } from "express";

export const bookFlight = async (req: Request, res: Response) => {
  const { userId, flightId, seat } = req.body;

  await db.query(
    "INSERT INTO bookings (user_id, flight_id, seat) VALUES (?, ?, ?)",
    [userId, flightId, seat]
  );

  res.json({ message: "Booking successful" });
};

export const getUserBookings = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const [rows] = await db.query(
    "SELECT * FROM bookings WHERE user_id = ?",
    [userId]
  );
  res.json(rows);
};

export const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.params;

  await db.query("DELETE FROM bookings WHERE id = ?", [id]);

  res.json({ message: "Booking cancelled" });
};