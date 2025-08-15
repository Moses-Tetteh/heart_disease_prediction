// index.js

import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
import os from "os";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

// 1) Load environment variables from ./env
dotenv.config({ path: "./env" });

// 2) Derive __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3) Serve static files from ../Frontend/dist
//    (Adjust this relative path if your Frontend build is elsewhere.)
const frontendDist = path.join(__dirname, "../Frontend/dist");
app.use(express.static(frontendDist));

// 4) Function to discover the local IPv4 address (non-internal)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// 5) Connect to MongoDB and then start Express
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("ERROR: ", error);
      throw error;
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);

      const localIp = getLocalIpAddress();
      console.log(`Local network address: http://${localIp}:${PORT}/`);
      console.log(`You can also access via http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!", err);
  });
