import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router =Router()

//It came from app.js 
//Now if user Entered localhost:3000/users/register

router.route("/register").post(registerUser);

export default router;
