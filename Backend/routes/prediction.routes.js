import express from "express";
import { heartpred } from "../controllers/pred.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Secured prediction route
router.route("/heart-pred").post(verifyJWT, heartpred);

export default router;
