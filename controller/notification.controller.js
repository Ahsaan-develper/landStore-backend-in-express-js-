// send notification

import mongoose from "mongoose";
import userNotificationModel from "../models/userNotificationModel.js";
import { NotFoundError } from "../utils/error.utils.js";


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