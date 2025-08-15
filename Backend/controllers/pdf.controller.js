// controllers/heartScraper.controller.js

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the Python executable in virtual environment
const pythonPath = path.resolve(__dirname, "../ML/.venv/Scripts/python.exe");

// Helper: Delete uploaded file
function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.error("Error deleting file:", err);
    else console.log("File deleted successfully");
  });
}

// Core runner: Executes Python script and handles result
function runPythonScript(scriptRelativePath, pdfPath, res) {
  const fullScriptPath = path.resolve(__dirname, scriptRelativePath);
  const fullPdfPath = path.resolve(__dirname, "..", pdfPath);

  const pythonProcess = spawn(pythonPath, [fullScriptPath, fullPdfPath]);

  let stdoutData = "";
  let stderrData = "";

  pythonProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  pythonProcess.on("close", (code) => {
    deleteFile(fullPdfPath);

    if (code !== 0) {
      console.error(`Script exited with code ${code}\n${stderrData}`);
      return !res.headersSent && res.status(500).send("Error processing PDF");
    }

    try {
      const result = JSON.parse(stdoutData);
      return !res.headersSent && res.json(result);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      console.error("Raw output:", stdoutData);
      return !res.headersSent && res.status(500).send("Invalid output from Python script");
    }
  });
}

// Heart Disease Report Scraper Endpoint
export const heartScraper = (req, res) => {
  if (!req.file || !req.file.filename) {
    return res.status(400).send("No PDF uploaded");
  }

  const pdfPath = path.join("uploads", req.file.filename);
  runPythonScript("../DataScrapingScripts/scrapHeart.py", pdfPath, res);
};
