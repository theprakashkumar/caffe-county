import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/errorHandlerMiddleware";
import authRouter from "./routes/auth.router";
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

//Routes
app.use("/api", authRouter);

app.get("/", (req, res) => {
  res.send({ message: "Hello Auth Service" });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth Service is running on http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Auth service error", error);
});
