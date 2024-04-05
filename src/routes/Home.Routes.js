import { Router } from "express";
import {
    dashboard,
    generateReferrelURL,
    leaderBoard,
    Onboarding,
    onboardingPage,
    sideMenu,
    tapMining,
    teams,
    useAnotherUserReferredCode
} from "../controllers/Home.Controller.js";
import { checkMiningStatus } from "../middlewares/checkMiningStatus.js";

const homeRouter = Router();

homeRouter
    .get("/", dashboard)
    .get("/teams", teams)
    .get("/mining", checkMiningStatus, tapMining)
    .get("/leaderBoard", leaderBoard)
    .get("/referrelURL", generateReferrelURL)
    .post("/apply-referrelCode", useAnotherUserReferredCode)
    .get("/onboarding", onboardingPage)
    .put("/onboarding", Onboarding)
    .get("/sideMenu",sideMenu)

export default homeRouter;