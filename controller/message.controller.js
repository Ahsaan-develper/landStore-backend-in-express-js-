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

        const { enquiry_id } = req.params;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const user_id = req.user.sub;
        const role = req.user.role;

        const enquiry = await enquiryModel.findById(enquiry_id);

        if (!enquiry) {
            throw new NotFoundError("Enquiry not found.");
        }

        if (
            role !== "super_admin" &&
            role !== "enquiry_admin" &&
            enquiry.user_id.toString() !== user_id
        ) {
            throw new ForbiddenError("You are not allowed to view this enquiry.");
        }

        // Mark messages as read
        if (role === "super_admin" || role === "enquiry_admin") {

            await messageModel.updateMany(
                {
                    enquiry_id: enquiry._id,
                    sender_id: null,
                    is_read: { $ne: true }
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
                    sender_id: { $ne: null },
                    is_read: { $ne: true }
                },
                {
                    $set: {
                        is_read: true,
                        read_at: new Date()
                    }
                }
            );

        }

        const totalMessages = await messageModel.countDocuments({
            enquiry_id: enquiry._id
        });

        const messages = await messageModel.aggregate([

            {
                $match: {
                    enquiry_id: enquiry._id
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            },

            {
                $skip: skip
            },

            {
                $limit: limit
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

                    body: 1,

                    is_read: 1,

                    read_at: 1,

                    createdAt: 1,

                    updatedAt: 1,

                    sender: {
                        _id: "$sender._id",
                        fullname: "$sender.fullname",
                        email: "$sender.email",
                        profile_image: "$sender.profile_image",
                        role: "$sender.role"
                    },

                    media: {
                        $map: {
                            input: "$media",
                            as: "m",
                            in: {
                                media_id: "$$m._id",
                                media_url: "$$m.media_url",
                                media_type: "$$m.media_type",
                                media_name: "$$m.media_name"
                            }
                        }
                    }

                }

            }

        ]);

        messages.reverse();

        return res.status(200).json({

            enquiry_id,

            page,

            totalMessages,

            totalPages: Math.ceil(totalMessages / limit),

            hasMore: page * limit < totalMessages,

            messages

        });

    } catch (err) {
        next(err);
    }
};


export const message_socket = (io, socket) => {

    socket.on("sendMessage", async (data) => {
        try {
            console.log(data);
            
            const {
                enquiry_id,
                body = "",
                files = []
            } = data;
            if (!enquiry_id) {
                return socket.emit("messageError", {
                    message: "Enquiry ID is required."
                });
            }
            if (
                !body.trim() &&
                files.length === 0
            ) {
                return socket.emit("messageError", {
                    message:
                        "Message or file is required."
                });

            }
            const enquiry =
                await enquiryModel.findById(
                    enquiry_id
                );


            if (!enquiry) {

                return socket.emit("messageError", {
                    message:
                        "Enquiry not found."
                });

            }
            let mediaDocument = null;
            if (files.length > 0) {

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

                    enquiry_id,

                    sender_id:
                        socket.user.sub,

                    body:
                        body.trim() || null,

                    media_id:
                        mediaDocument
                            ? [mediaDocument._id]
                            : [],

                    is_read: false

                });
            io.to(
                `enquiry:${enquiry_id}`
            ).emit(
                "newMessage",
                {
                    message_id:
                        message._id,
                    enquiry_id,
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
                }
            );
        } catch (error) {
            console.error(
                "Send message error:",
                error
            );
            socket.emit("messageError", {
                message:
                    "Failed to send message."
            })
        }
    });
};



export const enquiry_message_socket = (io, socket) => {

    socket.on("joinEnquiry", async (data) => {
        //   console.log("joinEnquiry received:", data);
        // console.log("Socket ID:", socket.id);
        
        try {
            const {
                enquiry_id,
                page = 1,
                limit = 10
            } = data || {};
            if (!enquiry_id) {
                return socket.emit("messageError", {
                    message: "Enquiry ID is required."
                });
            }
            if (!mongoose.Types.ObjectId.isValid(enquiry_id)) {
                return socket.emit("messageError", {
                    message: "Invalid enquiry ID."
                });
            }
            const currentPage = Math.max(
                Number(page) || 1,
                1
            );
            const currentLimit = Math.min(
                Math.max(Number(limit) || 10, 1),
                50
            );
            const skip =
                (currentPage - 1) * currentLimit;
            const enquiry = await enquiryModel
                .findById(enquiry_id)
                .lean();
            if (!enquiry) {
                return socket.emit("messageError", {
                    message: "Enquiry not found."
                });
            }
            const user_id = socket.user.sub;
            const role = socket.user.role;
            const isAdmin =
                role === "super_admin" ||
                role === "enquiry_admin";
            const isEnquiryOwner =
                enquiry.user_id &&
                enquiry.user_id.toString() === user_id.toString();
            if (!isAdmin && !isEnquiryOwner) {
                return socket.emit("messageError", {
                    message:
                        "You are not allowed to access this enquiry."
                });
            }
            const room = `enquiry:${enquiry_id}`;
            socket.join(room);
            const totalMessages =
                await messageModel.countDocuments({
                    enquiry_id: enquiry._id
                });

            let messages =
                await messageModel.aggregate([
                    {
                        $match: {
                            enquiry_id:
                                new mongoose.Types.ObjectId(
                                    enquiry_id
                                )
                        }
                    },

                    {
                        $sort: {
                            createdAt: -1
                        }
                    },

                    {
                        $skip: skip
                    },

                    {
                        $limit: currentLimit
                    },

                    // Sender
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

                    // Message media
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
                                fullname:
                                    "$sender.fullname",
                                email:
                                    "$sender.email",
                                profile_image:
                                    "$sender.profile_image",
                                role:
                                    "$sender.role"
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
            messages.reverse();
            const totalPages =
                Math.ceil(
                    totalMessages / currentLimit
                );
            const hasMore =
                currentPage < totalPages;
            socket.emit("enquiryMessages", {
                enquiry_id,
                page: currentPage,
                limit: currentLimit,
                totalMessages,
                totalPages,
                hasMore,
                messages
            });
        } catch (error) {
            console.error(
                "Join enquiry error:",
                error
            );
            socket.emit("messageError", {
                message:
                    "Failed to join enquiry."
            });
        }
    });
};