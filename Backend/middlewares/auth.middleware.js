import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    let token = null;

    // Check for token in cookies or Authorization header
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token is found
    if (!token) {
      throw new ApiError(401, "Unauthorized request - token missing");
    }

    // Log token for debugging (disable in production)
    console.log("Received Token:", token);

    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid access token - user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
