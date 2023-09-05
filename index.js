import express from "express";
import dotenv from "dotenv";
import { appRouter } from "./src/app.router.js";
import { connectDB } from "./db/connections.js";
const app = express();
dotenv.config();
const port = process.env.port;
// DB
connectDB();
// Routing
appRouter(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// thank you mr motaz and eng aya
