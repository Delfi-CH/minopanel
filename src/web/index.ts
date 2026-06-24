import { loadConfig } from "../lib/data/data";
import express from "express";

const config = loadConfig()
const port = 3000

const dir = config.paths.frontendDirectory

const app = express()

app.use("/", express.static(dir))

app.listen(port, "0.0.0.0", ()=>{
    console.log("server listening on port " + port)
})