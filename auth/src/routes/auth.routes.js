import { Router } from "express";
import passport from "passport";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { sendAuthNotification } from "../config/mq.js";

const authRouter = Router()

authRouter.get("/google",passport.authenticate("google",{
    scope: ["profile","email"],
    session: false,
    prompt: "select_account",
}))

authRouter.get("/google/callback",passport.authenticate("google",{
    failureRedirect: "/api/auth/google",
      session: false,
}),async (req,res)=>{
    try {
       const { id, displayName, emails, photos} = req.user
       let user = await User.findOne({googleId: id})

       if(!user){
        user = new User({
            googleId: id,
            name: displayName,
            email: emails[0].value,
            avatar: photos[0].value
        })
        await user.save()
       }
       
       await sendAuthNotification({
        userId: user._id,
        action: 'google_login',
        timestamp: new Date(),
        email: emails[0].value
       })

       // Generate JWT tokeen

       const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"})

       // Send token in cookie
       res.cookie("token",token,{ httpOnly: true })
       res.redirect("http://localhost:5173")
    } catch (error) {
        console.error("Error during Google authentication: ", error);
        res.redirect("/")
    }
})

authRouter.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({ status: "success", user });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default authRouter