// send notification

import mongoose from "mongoose";
import userNotificationModel from "../models/userNotificationModel.js";
import { NotFoundError } from "../utils/error.utils.js";
import { get_enquiry_details, get_listing_details } from "../utils/dbhelper.utils.js";


export const get_all_notifications = async (req, res, next) => {
    try {

        const user_id = req.user.sub;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const result = await userNotificationModel.aggregate([

            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id)
                }
            },

            {
                $facet: {

                    notifications: [

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
                                from: "notifications",
                                localField: "notification_id",
                                foreignField: "_id",
                                as: "notification"
                            }
                        },

                        {
                            $unwind: "$notification"
                        },

                        {
                            $project: {

                                _id: 0,

                                user_notification_id: "$_id",

                                notification_id: "$notification._id",

                                listing_id: "$notification.listing_id",

                                enquiry_id: "$notification.enquiry_id",

                                schedule_id: "$notification.schedule_id",

                                notifiable_type: "$notification.notifiable_type",

                                title: "$notification.title",

                                message: "$notification.message",

                                is_read: 1,

                                read_at: 1,

                                createdAt: "$notification.createdAt",

                                updatedAt: "$notification.updatedAt"

                            }
                        }

                    ],

                    totalCount: [
                        {
                            $count: "count"
                        }
                    ]

                }

            }

        ]);

        const notifications = result[0].notifications;

        const totalNotifications =
            result[0].totalCount[0]?.count || 0;

        const totalPages =
            Math.ceil(totalNotifications / limit);

        return res.status(200).json({

            page,

            totalPages,

            totalNotifications,

            notifications

        });

    } catch (err) {

        next(err);

    }
};

// get notification data 
export const get_notification_data = async (req, res, next) => {

    try {

        const { notification_id } = req.params;

        const user_id = req.user.sub;

        const userNotification = await userNotificationModel
            .findOne({
                _id: notification_id,
                user_id
            })
            .populate("notification_id").lean();


        if (!userNotification) {
            throw new NotFoundError("Notification not found.");
        }


        const notification = userNotification.notification_id;


        if (!notification) {
            throw new NotFoundError("Notification data not found.");
        }


        // Mark as read
        if (!userNotification.is_read) {

            await userNotificationModel.updateOne(
                { _id: userNotification._id },
                {
                    $set: {
                        is_read: true,
                        read_at: new Date()
                    }
                }
            );

            userNotification.is_read = true;
            userNotification.read_at = new Date();
        }


        let resource = null;


        switch (notification.notifiable_type) {

            case "Listing": {

                if (notification.listing_id) {

                    resource = await get_listing_details(
                        notification.listing_id
                    );

                }
                break;
            }

            case "Enquiry": {

                if (notification.enquiry_id) {

                    resource = await get_enquiry_details(
                        notification.enquiry_id
                    );

                }
                break;
            }

            case "Schedule": {

                if (notification.schedule_id) {

                    resource = await get_schedule_details(
                        notification.schedule_id
                    );

                }
                break;
            }
            case "Account": {

                resource = null;

                break;
            }


            default:
                throw new BadRequestError(
                    "Invalid notification type."
                );
        }


        return res.status(200).json({

            success: true,

            message: "Notification data retrieved successfully.",

            data: {

                notification: {

                    _id: notification._id,

                    title: notification.title,

                    message: notification.message,

                    notifiable_type:
                        notification.notifiable_type,

                    createdAt: notification.createdAt
                },

                is_read: userNotification.is_read,

                read_at: userNotification.read_at,

                resource

            }
        });


    } catch (error) {

        next(error);

    }
};
// mark all as read

export const mark_all_notifications_as_read = async (req, res, next) => {
    try {

        const user_id = req.user.sub;

        const result = await userNotificationModel.updateMany(
            {
                user_id,
                is_read: false
            },
            {
                $set: {
                    is_read: true,
                    read_at: new Date()
                }
            }
        );

        return res.status(200).json({
            message: "All notifications marked as read.",
            updated_notifications: result.modifiedCount
        });

    } catch (err) {
        next(err);
    }
};

// get single notification

export const get_single_notification = async (req, res, next) => {
    try {

        const { notification_id } = req.params;
        const user_id = req.user.sub;

        const notification = await userNotificationModel.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(notification_id),
                    user_id: new mongoose.Types.ObjectId(user_id)
                }
            },

            {
                $lookup: {
                    from: "notifications",
                    localField: "notification_id",
                    foreignField: "_id",
                    as: "notification"
                }
            },

            {
                $unwind: "$notification"
            },

            {
                $project: {
                    _id: 0,

                    user_notification_id: "$_id",

                    is_read: 1,
                    read_at: 1,

                    createdAt: "$notification.createdAt",

                    notification: {
                        notification_id: "$notification._id",
                        listing_id: "$notification.listing_id",
                        enquiry_id: "$notification.enquiry_id",
                        schedule_id: "$notification.schedule_id",
                        notifiable_type: "$notification.notifiable_type",
                        title: "$notification.title",
                        message: "$notification.message",
                        createdAt: "$notification.createdAt",
                        updatedAt: "$notification.updatedAt"
                    }
                }
            }

        ]);

        if (!notification.length) {
            throw new NotFoundError("Notification not found.");
        }

        if (!notification[0].is_read) {
            await userNotificationModel.findByIdAndUpdate(
                notification_id,
                {
                    is_read: true,
                    read_at: new Date()
                }
            );

            notification[0].is_read = true;
            notification[0].read_at = new Date();
        }

        return res.status(200).json({
            notification: notification[0]
        });

    } catch (err) {
        next(err);
    }
};

export const notification_socket = (io, socket) => {

    socket.on("markNotificationAsRead", async (data) => {
        try {
            const { notification_id } = data;

            if (!notification_id) {
                return socket.emit("notificationError", {
                    message: "Notification ID is required."
                });
            }
            const user_id = socket.user.sub;
            const notification = await userNotificationModel.findOneAndUpdate(
                { _id: notification_id, user_id, is_read: false },
                { $set: { is_read: true, read_at: new Date() } },
                { new: true }
            );
            if (!notification) {
                return socket.emit("notificationError", {
                    message: "Notification not found or already read."
                });
            }
            io.to(`user:${user_id}`).emit("notificationRead", {
                user_notification_id: notification._id,
                is_read: notification.is_read,
                read_at: notification.read_at
            });
        } catch (error) {
            console.error("Mark notification as read error:", error);
            socket.emit("notificationError", {
                message: "Failed to mark notification as read."
            });
        }
    });

    socket.on("markAllNotificationsAsRead", async () => {
        try {
            const user_id = socket.user.sub;
            const read_at = new Date();

            const result = await userNotificationModel.updateMany(
                { user_id, is_read: false },
                { $set: { is_read: true, read_at } }
            );

            io.to(`user:${user_id}`).emit("allNotificationsRead", {
                is_read: true,
                read_at,
                updated_notifications: result.modifiedCount
            });

        } catch (error) {
            console.error("Mark all notifications as read error:", error);
            socket.emit("notificationError", {
                message: "Failed to mark all notifications as read."
            });
        }
    });
}


// utils/send_notification.js
export const send_notification = (io, user_id, notification) => {
    io.to(`user:${user_id}`).emit("newNotification", {
        user_notification_id: notification.user_notification_id,
        title:                notification.title,
        message:              notification.message,
        notifiable_type:      notification.notifiable_type,
        is_read:              false,
        createdAt:            new Date()
    });
};