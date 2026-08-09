import express from "express";
import {
  getUserController,
  updateUserController,
  getPortfolioController,
} from "../controllers/userController.js";
import userAuth from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routes
// GET USER DATA || GET
router.post("/getUser", userAuth, getUserController);

// UPDATE USER || PUT
router.put("/update-user", userAuth, updateUserController);

// GET PORTFOLIO || GET
router.get("/portfolio/:id", getPortfolioController);

export default router;