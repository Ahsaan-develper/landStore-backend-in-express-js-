
import mongoose from "mongoose";
import notificationModel from "../models/notification.model.js";
import userNotificationModel from "../models/userNotificationModel.js";


export const createAndSendNotification = async (
    io,
    {
        user_id,
        title,
        message,
        notifiable_type,
        listing_id = null,
        enquiry_id = null,
        schedule_id = null
    }
) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const [notification] = await notificationModel.create(
            [{
                listing_id,
                enquiry_id,
                schedule_id,
                notifiable_type,
                title,
                message
            }],
            { session }
        );
        const [userNotification] = await userNotificationModel.create(
            [{
                notification_id: notification._id,
                user_id,
                is_read: false
            }],
            { session }
        );
        await session.commitTransaction();
        if (io) {
            io.to(`user:${user_id}`).emit("newNotification", {
                user_notification_id: userNotification._id,
                title,
                message,
                notifiable_type,
                is_read: false,
                createdAt: userNotification.createdAt
            });
        }
        return {
            notification,
            userNotification
        };
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw err;
    } finally {
        await session.endSession();
    }
};
// sockets/notification.socket.js
export const notification_socket = (io, socket) => {

    socket.on("joinUserRoom", ({ user_id }) => {
        socket.join(`user:${user_id}`);
    });

};