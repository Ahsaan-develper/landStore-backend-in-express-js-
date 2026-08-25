import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { _config } from "./config/envConfig.js";
import errorHandler from "./middleware/error.middleware.js";
import { connect_DB } from "./config/db.js";
import cookieParser from "cookie-parser";
import { auth_router } from "./routes/auth.routes.js";
import { admin_router } from "./routes/admin.routes.js";
import { trackVisitor } from "./middleware/trackvisitor.middleware.js";
import { listing_router } from "./routes/listing.routes.js";
import { folder_router } from "./routes/folder.routes.js";
import { enquiry_router } from "./routes/enquiry.routes.js";
import { message_router } from "./routes/message.routes.js";
import { schedule_router } from "./routes/schedule.routes.js";
import { notification_router } from "./routes/notification.routes.js";
import { section_router } from "./routes/section.routes.js";
import { enquiry_message_socket, message_socket } from "./controller/message.controller.js";
import { verify_socket_token } from "./middleware/jwt.middleware.js";
import { dashboard_router } from "./routes/dashboard.route.js";
import { notification_socket } from "./services/notification.service.js";

const app = express();

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
app.use("/notification"  , notification_router);
app.use("/section"  , section_router);
app.use("/dashboard"  , dashboard_router);

app.use(errorHandler)

const httpserver = createServer(app)
const io = new Server(httpserver, {
    maxHttpBufferSize: 10e6, 
    cors: {
    cors: {
        origin: "*"
    },
        // credentials: true
    }
});


app.set("io", io);
io.use(verify_socket_token);
io.on("connection", (socket) => {

    console.log(socket.id);
    message_socket(
        io,
        socket
    );
    notification_socket(io, socket);

    enquiry_message_socket(
        io,
        socket
    );
    socket.on("disconnect", () => {
        console.log(
            "Socket disconnected:",
            socket.id
        );
    });
});


const start_server = async( )=>{
    try {
        await connect_DB()
    httpserver.listen( _config.PORT, ()=>{
        console.log("Server is running on port ", _config.PORT);
    })
    }catch( err ){
        process.exit(1);
    }
}
start_server();