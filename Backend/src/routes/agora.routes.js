import { Router } from "express";
import { generateToken } from "../controllers/agora.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.route("/token").post(verifyJWT_username, generateToken);

export default router;
