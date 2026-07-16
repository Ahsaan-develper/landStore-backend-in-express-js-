import mongoose from "mongoose"
import { _config } from "./env.config.js";
import { InternalServerError } from "../middleware/error.middleware.js";


export const connect_DB = async ( )=>{

    try {
        
    // db connected message 
    mongoose.connection.on("connected" , ()=>{
        console.log("Db is connected !!!");
    })

    //db disconnected message 
    mongoose.connection.on("disconnected" ,()=>{
        console.log("DB is disconnected");
    });

    // db connection has error
    mongoose.connection.on("error" , (err)=>{
        console.log("DB connection has error" , err.message); 
    });

    // db close has error
    mongoose.connection.on("close" , ()=>{
        console.log("DB connection has error"); 
    });
    
    await mongoose.connect(_config.MONGO_DB_STRING)
    }catch ( err ){
        // process.exit(1);
        throw new InternalServerError( err );
    }
}

