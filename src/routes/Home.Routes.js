import { Router } from "express";
import {
    dashboard,
    generateReferrelURL,
    leaderBoard,
    tapMining,
    teams
} from "../controllers/Home.Controller.js";
import { checkMiningStatus } from "../middlewares/checkMiningStatus.js";

const homeRouter = Router();

homeRouter
    .get("/", dashboard)
    .get("/teams", teams)
    .get("/mining", checkMiningStatus, tapMining)
    .get("/leaderBoard", leaderBoard)
    .get("/referrelURL", generateReferrelURL)

export default homeRouter;