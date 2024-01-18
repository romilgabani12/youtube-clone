import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription } from "../controllers/subscription.controller.js";
import { getUserChannelSubscribers } from "../controllers/subscription.controller.js";
import { getSubscribedChannels } from "../controllers/subscription.controller.js";

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/channelId/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router.route("/userId/:subscriberId").get(getSubscribedChannels);

export default router