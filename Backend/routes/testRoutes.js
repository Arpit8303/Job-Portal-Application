import express from "express";
import { testPostController } from "../controllers/testController.js";
import userAuth from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routes
router.post("/test-post", userAuth, testPostController);

// Test GET route for browser testing
router.get("/test-get", (req, res) => {
  res.status(200).send("<h1>Test GET route is working perfectly! Your backend is up.</h1>");
});

//export
export default router;
