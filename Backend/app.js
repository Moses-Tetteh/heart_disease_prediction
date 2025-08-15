import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import predRouter from "./routes/prediction.routes.js";
import pdfRouter from "./routes/pdf.routes.js";

const app = express();

// ✅ Parse allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow requests with no origin (e.g., from Postman, curl)
      
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS")); // Handle disallowed origins
      }
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Middleware to parse JSON, handle URL-encoded forms, serve static files, and parse cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public")); // Serve static files from 'public' directory
app.use(cookieParser()); // Parse cookies

// Register routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/predict", predRouter);
app.use("/api/pdf", pdfRouter);

export { app };