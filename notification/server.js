import app from "./src/app.js"
import "dotenv/config"


app.listen(4000, ()=>{
    console.log("Notification service is running at port 4000")
})

