import mongoose from "mongoose";
import { _config } from "./envConfig.js";

export const connect_DB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("DB is connected !!!");
        });

        mongoose.connection.on("disconnected", () => {
            console.log("DB is disconnected");
        });

        mongoose.connection.on("error", (err) => {
            console.log("DB connection error:", err.message); 
        });

        await mongoose.connect(_config.MONGO_URL, {
            serverSelectionTimeoutMS : 10000,
            family                   : 4
        });

    } catch (err) {
        console.log("DB failed:", err.message); 
        
    }
};