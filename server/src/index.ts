import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import flightsRouter from "./routes/flights";
import bookingsRouter from "./routes/bookings";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/flights", flightsRouter);
app.use("/api/bookings", bookingsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));