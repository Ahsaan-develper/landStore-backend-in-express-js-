import messageModel from "../models/message.model.js";
import enquiryModel from "../models/enquiry.model.js";
import mongoose from "mongoose";
import mediaModel from "../models/media.model.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/error.utils.js";
import { get_media_type, upload_files_to_cloudinary } from "../services/cloudinary.service.js";
export const send_message = async (req, res, next) => {
    try {

        const { enquiry_id, body = "" } = req.body;

        const sender_id = req.user.sub;

        const files = req.files || [];

        if (!body.trim() && files.length === 0) {
            throw new BadRequestError(
                "Message or media is required."
            );
        }

        const enquiry = await enquiryModel.findById(enquiry_id);

        if (!enquiry) {
            throw new NotFoundError(
                "Enquiry not found."
            );
        }

        let mediaDocument = null;

        if (files.length) {

            const uploads =
                await upload_files_to_cloudinary(
                    files,
                    "messages"
                );

            mediaDocument =
                await mediaModel.create({

                    media_url:
                        uploads.map(x => x.url),

                    public_id:
                        uploads.map(x => x.public_id),

                    media_type:
                        uploads.map(x => get_media_type(x.format)),

                    media_name:
                        files.map(x => x.originalname)

                });

        }

        const message =
            await messageModel.create({

                enquiry_id,

                sender_id,

                body,

                media_id:
                    mediaDocument
                        ? [mediaDocument._id]
                        : []

            });

        return res.status(201).json({

            message: "Message sent successfully.",

            data: {

                message_id: message._id

            }

        });

    } catch (err) {

        next(err);

    }
};


// get all one enquiry messages
export const get_enquiry_messages = async (req, res, next) => {

    try {

        const {
            enquiry_id,
        } = req.params;
        const {   before_id } = req.query;
        if (!enquiry_id) {
            throw new BadRequestError(
                "Enquiry ID is required."
            );
        }
        if (!mongoose.isValidObjectId(enquiry_id)) {
            throw new BadRequestError(
                "Invalid enquiry ID."
            );
        }

        if (
            before_id &&
            !mongoose.isValidObjectId(before_id)
        ) {
            throw new BadRequestError(
                "Invalid before_id."
            );
        }

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            50
        );

        const user_id = req.user.sub;
        const role = req.user.role;

        const enquiry = await enquiryModel
            .findById(enquiry_id)
            .select("_id user_id")
            .lean();

        if (!enquiry) {
            throw new NotFoundError(
                "Enquiry not found."
            );
        }

        const isAdmin =
            role === "super_admin" ||
            role === "enquiry_admin";

        const isOwner =
            enquiry.user_id &&
            enquiry.user_id.toString() === user_id;


        if (!isAdmin && !isOwner) {
            throw new ForbiddenError(
                "You are not allowed to view this enquiry."
            );
        }

        if (isAdmin) {

            await messageModel.updateMany(
                {
                    enquiry_id: enquiry._id,

                    sender_id: {
                        $ne: null
                    },

                    is_read: {
                        $ne: true
                    }
                },
                {
                    $set: {
                        is_read: true,
                        read_at: new Date()
                    }
                }
            );

        } else {

            await messageModel.updateMany(
                {
                    enquiry_id: enquiry._id,

                    sender_id: null,

                    is_read: {
                        $ne: true
                    }
                },
                {
                    $set: {
                        is_read: true,
                        read_at: new Date()
                    }
                }
            );
        }

        const match = {
            enquiry_id: enquiry._id
        };


        if (before_id) {

            match._id = {
                $lt: new mongoose.Types.ObjectId(
                    before_id
                )
            };
        }
        let messages = await messageModel.aggregate([

            {
                $match: match
            },

            {
                $sort: {
                    _id: -1
                }
            },

            {
                $limit: limit + 1
            },

            {
                $lookup: {
                    from: "users",

                    localField: "sender_id",

                    foreignField: "_id",

                    as: "sender"
                }
            },


            {
                $unwind: {
                    path: "$sender",

                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "media",

                    localField: "media_id",

                    foreignField: "_id",

                    as: "media"
                }
            },
            {
                $project: {

                    _id: 0,

                    message_id: "$_id",

                    enquiry_id: 1,

                    body: 1,

                    is_read: 1,

                    read_at: 1,

                    createdAt: 1,

                    updatedAt: 1,


                    sender: {
                        _id: "$sender._id",

                        fullname: "$sender.fullname",

                        email: "$sender.email",

                        profile_image:
                            "$sender.profile_image",

                        role: "$sender.role"
                    },


                    media: {
                        $map: {
                            input: "$media",

                            as: "m",

                            in: {

                                media_id:
                                    "$$m._id",

                                media_url:
                                    "$$m.media_url",

                                media_type:
                                    "$$m.media_type",

                                media_name:
                                    "$$m.media_name"
                            }
                        }
                    }
                }
            }
        ]);

        const hasMore =
            messages.length > limit;

        if (hasMore) {

            messages = messages.slice(
                0,
                limit
            );
        }


        messages.reverse();


        const next_cursor =
            messages.length > 0
                ? messages[0].message_id.toString()
                : before_id || null;

        return res.status(200).json({

            enquiry_id,

            messages,

            next_cursor,

            hasMore

        });

    } catch (err) {

        next(err);
    }
};



export const message_socket = (io, socket) => {

    socket.on("sendMessage", async (data) => {

        try {
            const {
                enquiry_id,
                body = "",
                files = []
            } = data || {};

            if (!enquiry_id) {

                return socket.emit("messageError", {
                    message:
                        "Enquiry ID is required."
                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    enquiry_id
                )
            ) {

                return socket.emit("messageError", {
                    message:
                        "Invalid enquiry ID."
                });

            }


            const cleanBody =
                typeof body === "string"
                    ? body.trim()
                    : "";


            if (
                !cleanBody &&
                (!files || files.length === 0)
            ) {

                return socket.emit("messageError", {
                    message:
                        "Message or file is required."
                });

            }

            const enquiry =
                await enquiryModel
                    .findById(enquiry_id)
                    .lean();


            if (!enquiry) {

                return socket.emit("messageError", {
                    message:
                        "Enquiry not found."
                });

            }


            const sender_id =
                socket.user.sub.toString();

            const sender_role =
                socket.user.role;


            const is_admin =
                sender_role === "super_admin" ||
                sender_role === "enquiry_admin";


            const is_enquiry_owner =
                !is_admin &&
                enquiry.user_id?.toString() ===
                    sender_id;

            if (
                !is_admin &&
                !is_enquiry_owner
            ) {

                return socket.emit("messageError", {
                    message:
                        "You are not allowed to send messages to this enquiry."
                });

            }

            const room =
                `enquiry:${enquiry_id}`;

            if (!socket.rooms.has(room)) {

                return socket.emit("messageError", {
                    message:
                        "Please join the enquiry before sending a message."
                });

            }

            let mediaDocument = null;


            if (
                files &&
                files.length > 0
            ) {

                const uploads =
                    await upload_files_to_cloudinary(
                        files,
                        "messages"
                    );


                const media_urls = [];
                const public_ids = [];
                const media_types = [];
                const media_names = [];


                for (
                    let i = 0;
                    i < uploads.length;
                    i++
                ) {

                    const upload =
                        uploads[i];

                    const file =
                        files[i];


                    media_urls.push(
                        upload.url
                    );

                    public_ids.push(
                        upload.public_id
                    );

                    media_types.push(
                        get_media_type(
                            upload.format
                        )
                    );

                    media_names.push(
                        file.name
                    );

                }


                mediaDocument =
                    await mediaModel.create({

                        media_url:
                            media_urls,

                        public_id:
                            public_ids,

                        media_type:
                            media_types,

                        media_name:
                            media_names

                    });

            }

            const message =
                await messageModel.create({

                    enquiry_id:
                        enquiry._id,

                    sender_id:
                        socket.user.sub,

                    body:
                        cleanBody || null,

                    media_id:
                        mediaDocument
                            ? [mediaDocument._id]
                            : [],

                    is_read:
                        false

                });

            const messageData = {

                message_id:
                    message._id,

                enquiry_id:
                    message.enquiry_id,

                sender_id:
                    message.sender_id,

                body:
                    message.body,

                media:
                    mediaDocument
                        ? {

                            media_id:
                                mediaDocument._id,

                            media_url:
                                mediaDocument.media_url,

                            public_id:
                                mediaDocument.public_id,

                            media_type:
                                mediaDocument.media_type,

                            media_name:
                                mediaDocument.media_name

                        }
                        : null,

                is_read:
                    message.is_read,

                createdAt:
                    message.createdAt

            };

            const room_sockets =
                await io
                    .in(room)
                    .fetchSockets();


            let receiver_sockets = [];
            if (is_admin) {
                receiver_sockets =
                    room_sockets.filter(
                        (room_socket) => {
                            return (
                                room_socket.id !== socket.id &&
                                room_socket.user?.sub?.toString() ===
                                    enquiry.user_id?.toString()     
                            );
                        }
                    );
            } else {

                receiver_sockets =
                    room_sockets.filter(
                        (room_socket) => {

                            return (
                                room_socket.id !==
                                    socket.id &&

                                (
                                    room_socket.user?.role ===
                                        "super_admin"

                                    ||

                                    room_socket.user?.role ===
                                        "enquiry_admin"
                                )
                            );

                        }
                    );

                const other_devices =
                    room_sockets.filter(
                        (room_socket) => {

                            return (

                                room_socket.id !==
                                    socket.id

                                &&

                                room_socket.user?.sub
                                    ?.toString() ===
                                    sender_id

                                &&

                                room_socket.user?.role ===
                                    "individual"

                            );

                        }
                    );


                receiver_sockets.push(
                    ...other_devices
                );

            }

            receiver_sockets = [
                ...new Map(
                    receiver_sockets.map(
                        (room_socket) => [
                            room_socket.id,
                            room_socket
                        ]
                    )
                ).values()
            ];
            if (
                receiver_sockets.length > 0
            ) {

                for (
                    const receiver
                    of receiver_sockets
                ) {

                    io.to(
                        receiver.id
                    ).emit(
                        "newMessage",
                        messageData
                    );

                }

            } else {

                console.log(
                    "ℹ Receiver is offline/not in this enquiry."
                );

            }

            socket.emit(
                "messageSent",
                messageData
            );

        } catch (error) {

            console.error(
                " Send message error:",
                error
            );


            socket.emit(
                "messageError",
                {
                    message:
                        "Failed to send message."
                }
            );

        }

    });

};



export const enquiry_message_socket = (io, socket) => {

    socket.on("joinEnquiry", async (data) => {

        try {
            const { enquiry_id } = data || {};

            if (!enquiry_id) {
                return socket.emit("messageError", {
                    message: "Enquiry ID is required."
                });
            }
            if (!mongoose.Types.ObjectId.isValid(enquiry_id)) {

                console.log(" Invalid enquiry ID");

                return socket.emit("messageError", {
                    message: "Invalid enquiry ID."
                });
            }
            const enquiry =
                await enquiryModel
                    .findById(enquiry_id)
                    .lean();

            if (!enquiry) {
                return socket.emit("messageError", {
                    message: "Enquiry not found."
                });
            }
            const user_id =
                socket.user.sub.toString();

            const role =
                socket.user.role;

            const is_admin =
                role === "super_admin" ||
                role === "enquiry_admin";

            const is_enquiry_owner =
                !is_admin &&
                enquiry.user_id?.toString() === user_id;

            if (!is_admin && !is_enquiry_owner) {

                console.log(" NOT AUTHORIZED");

                return socket.emit("messageError", {
                    message:
                        "You are not allowed to access this enquiry."
                });
            }


            const room =
                `enquiry:${enquiry_id}`;
 if (socket.rooms.has(room)) {       
            } else {
                await socket.join(room);
            }
            const sockets_in_room =
                await io
                    .in(room)
                    .fetchSockets();
        
            socket.emit("joinedEnquiry", {
                enquiry_id
            });


        } catch (error) {

            console.error(
                " Join enquiry error:",
                error
            );

            socket.emit("messageError", {
                message:
                    "Failed to join enquiry."
            });

        }

    });

};