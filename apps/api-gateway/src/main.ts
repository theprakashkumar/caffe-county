import express, { Request } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import proxy from "express-http-proxy";

const app = express();
// origin: 'http://localhost:3000'
// - Restricts which domains can access the API
// - Only requests from http://localhost:3000 will be allowed
// - Prevents cross-origin requests from unauthorized domains
//
// allowedHeaders: ['Authorization', 'content-type']
// - Specifies which HTTP headers can be used in requests
// - Authorization: Allows authentication tokens to be sent
// - content-type: Allows specification of data format (JSON, form data, etc.)
// - Other headers will be rejected
//
// credentials: true
// - Allows cookies, authorization headers, and TLS client certificates
// - Enables authenticated requests across domains
// - Required for sessions and token-based auth to work cross-origin

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "content-type"],
    credentials: true,
  })
);
app.use(morgan("dev"));
// 	Purpose: Parses incoming requests with JSON payloads.
//  When the client (like a frontend app or Postman) sends data with Content-Type: application/json.
// The 'limit' option sets the maximum size of the JSON payload that can be accepted
// by the server. Here it's set to '100mb', allowing large JSON requests up to 100 megabytes.
// Without this limit, Express defaults to '100kb', which might be too small for some applications.
app.use(express.json({ limit: "100mb" }));
// 	Purpose: Parses incoming requests with URL-encoded payloads (the kind that HTML forms submit by default).
// Usage: When the client sends data with Content-Type: application/x-www-form-urlencoded.
// The 'extended' option allows for parsing of nested objects and arrays.
// It's set to 'true' to support parsing of complex JSON structures.
// The 'limit' option sets the maximum size of the URL-encoded payload that can be accepted
// by the server. Here it's set to '100mb', allowing large URL-encoded requests up to 100 megabytes.
// Without this limit, Express defaults to '100kb', which might be too small for some applications.
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(cookieParser());
// Purpose: Configures Express to trust the first reverse proxy server sitting in front of the application.
// Usage: When deploying behind a load balancer or reverse proxy (like Nginx, Heroku, AWS ELB),
// the proxy forwards the request to the Express app. The proxy typically sets headers like
// 'X-Forwarded-For' (original client IP), 'X-Forwarded-Proto' (original protocol, http/https), etc.
// By setting 'trust proxy' to 1, Express is told to trust the information in these headers
// coming from the *first* proxy hop.
// This ensures that features like `req.ip`, `req.protocol`, `req.secure`, and rate limiting
// (which often relies on `req.ip`) work correctly based on the original client's information,
// not the proxy's. Without this, `req.ip` would be the proxy's IP address.
app.set("trust proxy", 1);
//Apply rete limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => (req.user ? 1000 : 100),
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip || "unknown",
});
app.use(limiter);
// Auth Service
app.use("/", proxy("http://localhost:6001"));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Gateway is healthy!" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`API Gateway is listening at http://localhost:${port}`);
});
server.on("error", (error) => {
  console.error("API Gateway error", error);
});
