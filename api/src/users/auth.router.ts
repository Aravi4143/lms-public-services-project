import { Router } from "express";
import { loginHandler } from "./login.handler";
import { registerHandler } from "./register.handler";
import multer from "multer";

export const authRouter = Router();
const upload = multer({ dest: "uploads/" });

authRouter.post("/login", upload.single("image"), loginHandler);
authRouter.post("/register", upload.single("image"), registerHandler);
