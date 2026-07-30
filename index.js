import express from "express";
import { _config } from "./config/envConfig.js";
import errorHandler from "./middleware/error.middleware.js";
import { connect_DB } from "./config/db.js";
import { InternalServerError } from "./utils/error.utils.js";
import cookieParser from "cookie-parser";
import { auth_router } from "./routes/auth.routes.js";
import { admin_router } from "./routes/admin.routes.js";
import { trackVisitor } from "./middleware/trackvisitor.middleware.js";
import { listing_router } from "./routes/listing.routes.js";
import { folder_router } from "./routes/folder.routes.js";
import { enquiry_router } from "./routes/enquiry.routes.js";
import { message_router } from "./routes/message.routes.js";
import { schedule_router } from "./routes/schedule.routes.js";

const app = express();
app.use(errorHandler)
app.use(express.json())
app.use(cookieParser())
app.use(trackVisitor);

app.use("/auth"  , auth_router);
app.use("/admin"  , admin_router);
app.use("/listing"  , listing_router);
app.use("/folder"  , folder_router);
app.use("/enquiry"  , enquiry_router);
app.use("/message"  , message_router);
app.use("/schedule"  , schedule_router);
const start_server = async( )=>{
    try {
        await connect_DB()
    app.listen( _config.PORT, ()=>{
        console.log("Server is running on port ", _config.PORT);
    })
    }catch( err ){
        process.exit(1);
        InternalServerError( err );
    }
}
start_server();