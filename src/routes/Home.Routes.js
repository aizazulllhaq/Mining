import { Router } from "express";
import { tapMining } from "../controllers/Home.Controller.js";
import { checkMiningStatus } from "../middlewares/checkMiningStatus.js";

const homeRouter = Router();

homeRouter.route("/mining")
    .get(checkMiningStatus,tapMining)


export default homeRouter;