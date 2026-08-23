import { io } from "socket.io-client";
import fs from "fs";
import path from "path";

const SOCKET_URL = "http://localhost:5000";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTZkZDUwZTk4MWZhMjQ5NTc5ZjlmNmMiLCJyb2xlIjoiaW5kaXZpZHVhbCIsImlhdCI6MTc4NzMzMTM1OCwiZXhwIjoxNzg3MzQ5MzU4fQ._3N-pxELxCLLnTEgL5b7WRTbkOOwyhN_7JUbb-8miOM" 
const ENQUIRY_ID = "6a6e0d4889b6d1888ee74de1";
const FILE_PATH = "./public/lap.png";

const socket = io(SOCKET_URL, {
    auth: { token: TOKEN }
});

socket.on("connect", () => {
    console.log("Connected:", socket.id);

    socket.emit("joinEnquiry", { enquiry_id: ENQUIRY_ID });

    setTimeout(() => {
        const buffer = fs.readFileSync(FILE_PATH);
        console.log("Sending file, size:", buffer.length, "bytes");

        socket.emit("sendMessage", {
            enquiry_id: ENQUIRY_ID,
            body: "Here is the document.",
            files: [
                {
                    name: path.basename(FILE_PATH),
                    type: "image/png",
                    buffer: buffer
                }
            ]
        });
    }, 1000);
});

socket.on("newMessage", (data) => {
    console.log("Success! Message received:", JSON.stringify(data, null, 2));
    socket.disconnect();
});

socket.on("messageError", (err) => {
    console.error("Message error:", err);
});

socket.on("connect_error", (err) => {
    console.error("Auth/connection failed:", err.message);  // ← expired token shows here
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
});