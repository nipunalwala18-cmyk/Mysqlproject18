import { db } from "../config/db";
import { Request, Response } from "express";

export const getFlights = async (req: Request, res: Response) => {
  const [rows] = await db.query("SELECT * FROM flights");
  res.json(rows);
};