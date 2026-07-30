import messageModel from "../models/message.model.js";
import enquiryModel from "../models/enquiry.model.js";
import mediaModel from "../models/media.model.js";
import mongoose from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/error.utils.js";
import { upload_files_to_cloudinary } from "../services/cloudinary.service.js";
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

        const user_id = req.user.sub;
        const role = req.user.role;

        const enquiry = await enquiryModel.findById(enquiry_id);

        if (!enquiry) {
            throw new NotFoundError("Enquiry not found.");
        }

        // Allow only enquiry owner or admins
        if (
            role !== "super_admin" &&
            role !== "enquiry_admin" &&
            enquiry.user_id.toString() !== user_id
        ) {
            throw new ForbiddenError("You are not allowed to view this enquiry.");
        }

        // ---------------- MARK AS READ ----------------

        if (role === "super_admin" || role === "enquiry_admin") {

            // Admin reads enquiry messages
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

            // Enquiry reads admin messages
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

        // ---------------- FETCH MESSAGES ----------------

        const messages = await messageModel.aggregate([

            {
                $match: {
                    enquiry_id: enquiry._id
                }
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
            },

            {
                $sort: {
                    createdAt: 1
                }
            }

        ]);

        return res.status(200).json({
            enquiry_id,
            total_messages: messages.length,
            messages
        });

    } catch (err) {
        next(err);
    }
};