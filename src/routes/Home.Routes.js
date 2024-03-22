import { Router } from "express";
import {
    applyAnotherUserReferredCodeToDoMining,
    generateReferrelURL,
    leaderBoard,
    tapMining
} from "../controllers/Home.Controller.js";
import { checkMiningStatus } from "../middlewares/checkMiningStatus.js";

const homeRouter = Router();

homeRouter
    .post("/apply-referrelCode", applyAnotherUserReferredCodeToDoMining)
    .get("/mining", checkMiningStatus, tapMining)
    .get("/leaderBoard", leaderBoard)
    .get("/referrelURL", generateReferrelURL)

export default homeRouter;