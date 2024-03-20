import { Router } from "express";
import { generateReferrelURL, leaderBoard, tapMining } from "../controllers/Home.Controller.js";
import { checkMiningStatus } from "../middlewares/checkMiningStatus.js";

const homeRouter = Router();

homeRouter.route("/mining")
    .get(checkMiningStatus, tapMining)

homeRouter.get("/leaderBoard", leaderBoard)

homeRouter.get("/referrelURL", generateReferrelURL);

export default homeRouter;