import { Router } from "express";
import { startMining } from "../controllers/Mining.Controller.js";
import { checkMiningStatus } from "../middlewares/checkMiningStatus.js";

const miningRouter = Router();

miningRouter.route("/mining")
    .get(checkMiningStatus,startMining)


export default miningRouter;