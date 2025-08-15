// controllers/heart.controller.js

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { runPython } from "../utils/pythonRunner.js";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Fix here: Only one "Backend" in the path ===
const HEART_SCRIPT = path.join(
  __dirname,
  "..",             // from controllers/ back to Backend/
  "ML",             // then into ML/
  "Heart Disease Prediction",
  "heartpredict.py"
);

/**
 * Ensures that the provided array of fields is numeric (and defined).
 * `names` should be an array of the same length, giving each field’s name for error messages.
 */
const validateNumericFields = (fields, names) => {
  // Check for missing fields
  if (fields.some((v) => v === undefined)) {
    throw new ApiError(400, "All input fields (p1–p13) must be provided");
  }
  // Check that each field can be parsed to a number
  fields.forEach((val, idx) => {
    if (isNaN(Number(val))) {
      throw new ApiError(400, `${names[idx]} must be numeric (got "${val}")`);
    }
  });
};

/**
 * POST /api/v1/predict/heart-pred
 * Body JSON:
 *   {
 *     p1: <age>,
 *     p2: <sex or "male"/"female">,
 *     p3: <cp>,
 *     p4: <trestbps>,
 *     p5: <chol>,
 *     p6: <fbs or "yes"/"no">,
 *     p7: <restecg>,
 *     p8: <thalach>,
 *     p9: <exang or "yes"/"no">,
 *     p10: <oldpeak>,
 *     p11: <slope>,
 *     p12: <ca>,
 *     p13: <thal>
 *   }
 *
 * - sex (p2) must become 0 or 1
 * - fbs (p6) must become 0 or 1
 * - exang (p9) must become 0 or 1
 *
 * Returns:
 *   {
 *     prediction: "<raw Python output>",
 *     result: "<human message>"
 *   }
 */
export const heartpred = asyncHandler(async (req, res) => {
  // Destructure all 13 fields from request body
  const {
    p1, p2, p3, p4, p5,
    p6, p7, p8, p9, p10,
    p11, p12, p13,
  } = req.body;

  // 1) Validate numeric fields (except p2, p6, p9 for now)
  validateNumericFields(
    [p1, p3, p4, p5, p7, p8, p10, p11, p12, p13],
    [
      "p1 (age)",
      "p3 (cp)",
      "p4 (trestbps)",
      "p5 (chol)",
      "p7 (restecg)",
      "p8 (thalach)",
      "p10 (oldpeak)",
      "p11 (slope)",
      "p12 (ca)",
      "p13 (thal)",
    ]
  );

  // 2) Convert/validate categorical fields:
  //    p2 → sex: allow 0/1 or "male"/"female" (case-insensitive)
  let sex;
  if (p2 === undefined) {
    throw new ApiError(400, "p2 (sex) must be provided");
  } else if (!isNaN(Number(p2))) {
    sex = Number(p2);
  } else {
    const lowered = String(p2).trim().toLowerCase();
    if (lowered === "male" || lowered === "m") {
      sex = 1;
    } else if (lowered === "female" || lowered === "f") {
      sex = 0;
    } else {
      throw new ApiError(
        400,
        `p2 (sex) must be 0, 1, "male", or "female" (got "${p2}")`
      );
    }
  }
  if (![0, 1].includes(sex)) {
    throw new ApiError(400, `p2 (sex) must be 0 or 1 (got ${sex})`);
  }

  //    p6 → fbs: allow 0/1 or "yes"/"no"
  let fbs;
  if (p6 === undefined) {
    throw new ApiError(400, "p6 (fbs) must be provided");
  } else if (!isNaN(Number(p6))) {
    fbs = Number(p6);
  } else {
    const lowered = String(p6).trim().toLowerCase();
    if (lowered === "yes" || lowered === "y") {
      fbs = 1;
    } else if (lowered === "no" || lowered === "n") {
      fbs = 0;
    } else {
      throw new ApiError(
        400,
        `p6 (fbs) must be 0, 1, "yes", or "no" (got "${p6}")`
      );
    }
  }
  if (![0, 1].includes(fbs)) {
    throw new ApiError(400, `p6 (fbs) must be 0 or 1 (got ${fbs})`);
  }

  //    p9 → exang: allow 0/1 or "yes"/"no"
  let exang;
  if (p9 === undefined) {
    throw new ApiError(400, "p9 (exang) must be provided");
  } else if (!isNaN(Number(p9))) {
    exang = Number(p9);
  } else {
    const lowered = String(p9).trim().toLowerCase();
    if (lowered === "yes" || lowered === "y") {
      exang = 1;
    } else if (lowered === "no" || lowered === "n") {
      exang = 0;
    } else {
      throw new ApiError(
        400,
        `p9 (exang) must be 0, 1, "yes", or "no" (got "${p9}")`
      );
    }
  }
  if (![0, 1].includes(exang)) {
    throw new ApiError(400, `p9 (exang) must be 0 or 1 (got ${exang})`);
  }

  // 3) Build args array in the exact order heartpredict.py expects:
  //    [ age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal ]
  const args = [
    Number(p1).toString(),
    sex.toString(),
    Number(p3).toString(),
    Number(p4).toString(),
    Number(p5).toString(),
    fbs.toString(),
    Number(p7).toString(),
    Number(p8).toString(),
    exang.toString(),
    Number(p10).toString(),
    Number(p11).toString(),
    Number(p12).toString(),
    Number(p13).toString(),
  ];

  // 4) Call the Python script
  let pythonOutput;
  try {
    console.log("→ Running Python command:", [HEART_SCRIPT, ...args]);
    pythonOutput = await runPython(HEART_SCRIPT, args);
  } catch (err) {
    console.error("Error invoking heartpredict.py:", err);
    throw new ApiError(500, `Python error: ${err.message}`);
  }

  // 5) Parse the Python output: "Prediction: X, Probability: Y.YYYY"
  // Find the line that starts with "Prediction:"
  const predictionLine = pythonOutput
    .split("\n")
    .find((line) => line.startsWith("Prediction:"));

  if (!predictionLine) {
    console.error("Unexpected Python output:", pythonOutput);
    throw new ApiError(500, "Could not find 'Prediction:' in script output");
  }

  const match = predictionLine.match(/Prediction:\s*([01])\b/);
  if (!match) {
    console.error("Could not parse prediction line:", predictionLine);
    throw new ApiError(500, "Malformed prediction line in script output");
  }

  let predictedClass = Number(match[1]);



  // 6) Build a human‐readable message
  const message =
    predictedClass === 1
      ? "The person IS suffering from Heart Disease"
      : "The person is NOT suffering from Heart Disease";

  // 7) Return both the raw Python output and the human‐readable result
  res.status(200).json({
    prediction: pythonOutput,
    result: message,
  });
});
