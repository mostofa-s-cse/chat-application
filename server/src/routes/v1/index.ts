import express from "express";
import authRoutes from "./auth";
import callRoutes from "./callRoutes";
import chatRoutes from "./chatRoutes";
import emailRoutes from "./email";
import fileRoutes from "./fileRoutes";
import userRoutes from "./users";

const router = express.Router();

// Auth and User Management Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/queue-jobs", emailRoutes);

// Chat and Communication Routes
router.use("/chat", chatRoutes);
router.use("/call", callRoutes);
router.use("/file", fileRoutes);

export default router;
