import { Router } from "express";
import { 
  initiateCall, 
  acceptCall, 
  rejectCall, 
  endCall,
  getCallStatus 
} from "../controllers/videocall.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

// Videocall routes
router.route("/initiate").post(verifyJWT_username, initiateCall);
router.route("/accept").post(verifyJWT_username, acceptCall);
router.route("/reject").post(verifyJWT_username, rejectCall);
router.route("/end").post(verifyJWT_username, endCall);
router.route("/status/:callId").get(verifyJWT_username, getCallStatus);

export default router;



