import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router =Router()

//It came from app.js 
//Now if user Entered localhost:3000/users/register

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);
//Register Route main I Want to use MiddleWare Just Jaate hue mujse Mike Jana


export default router;
