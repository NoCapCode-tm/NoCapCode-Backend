import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://nocapcode.cloud",
  "https://atlas.nocapcode.cloud",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server calls

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);




//general settings
app.use(express.json({limit:"16mb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use("/public", express.static("public"));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));


import liverouteroute from "./routes/Live.routes.js";
import { jobrouter } from "./routes/Job.routes.js"


app.use("/api/v1/job", jobrouter);
app.use("/api/v1/atlas", liverouteroute);

export {app}