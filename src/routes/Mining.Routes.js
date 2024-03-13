import { Router } from "express";
import { startMining } from "../controllers/Mining.Controller.js";

const miningRouter = Router();

miningRouter.route("/mining")
    .get(startMining)


export default miningRouter;