import express from "express";
import { _config } from "./config/env.config.js";
import { connect_DB } from "./config/db.js";
import { InternalServerError } from "./middleware/error.middleware.js";
import { user_router } from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import { admin_router } from "./routes/admin.routes.js";
import { company_router } from "./routes/company.routes.js";
import { keropasi_router } from "./routes/keropasi.routes.js";
import { news_router } from "./routes/news.routes.js";
import { entity_router } from "./routes/entityType.routes.js";
import { review_router } from "./routes/reviews.routes.js";
import { country_code_router } from "./routes/countryPhoneCode.routes.js";
import { malaysia_router } from "./routes/malaysia.routes.js";
import { listing_router } from "./routes/listing.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use("/user" , user_router);
app.use("/admin" , admin_router);
app.use("/keropasi" , keropasi_router);
app.use("/company" , company_router );
app.use("/news" , news_router);
app.use("/entity" , entity_router)
app.use("/review" , review_router)
app.use("/code", country_code_router)
app.use("/states", malaysia_router)
app.use("/listing" , listing_router)
const start_server = async ( )=>{
   try {
     await connect_DB();
    app.listen(_config.PORT , ()=>{
        console.log("Server running on port ",_config.PORT);
    })
   }catch( err ){
    process.exit(1);
    throw new InternalServerError( err );
   }
}

start_server();