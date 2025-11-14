import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import airportsRouter from "./routes/airports";
import aircraftRouter from "./routes/aircraft";
import routesRouter from "./routes/routes";
import flightsRouter from "./routes/flights";
import bookingsRouter from "./routes/bookings";
import profilesRouter from "./routes/profiles";
import rolesRouter from "./routes/roles";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/airports", airportsRouter);
app.use("/api/aircraft", aircraftRouter);
app.use("/api/routes", routesRouter);
app.use("/api/flights", flightsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/roles", rolesRouter);

app.listen(process.env.PORT || 4000);
