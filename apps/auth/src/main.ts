import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/errorHandlerMiddleware";
import authRouter from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger.json");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["content-type", "Authorization"],
    credentials: true,
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api-docs", (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use("/api", authRouter);

app.get("/", (req, res) => {
  res.send({ message: "Hello Auth Service" });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth Service is running on http://localhost:${port}`);
  console.log(`API Docs: http://localhost:${port}/api-docs`);
});

server.on("error", (error) => {
  console.error("Auth service error", error);
});
