import express from "express";
import { _config } from "./config/env.config.js";

const app = express();


const start_server = async ( )=>{
    app.listen(_config.PORT , ()=>{
        console.log("Server running on port ",_config.PORT);
        
    })
}

start_server();