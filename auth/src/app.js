import "dotenv/config"
import express from "express"
import morgan from 'morgan' 
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import cookies from "cookie-parser"
import authRouter from "./routes/auth.routes.js"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookies())
app.use(morgan("dev"))

app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    
},(accessToken, refreshToken, profile, done)=>{
    
    return done(null,profile)
}))

app.get("/status/healthz",(req,res)=>{
    res.status(200).json({ status: 'ok'})
})

app.get("/status/readyz",(req,res)=>{
    res.status(200).json({ status: 'ok'})
})
 
app.use('/api/auth', authRouter)



export default app