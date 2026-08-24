
import mongoose from "mongoose";
import notificationModel from "../models/notification.model.js";
import userNotificationModel from "../models/userNotificationModel.js";

export const createAndSendNotification = async (io, {
    user_id,
    title,
    message,
    notifiable_type,
    listing_id  = null,
    enquiry_id  = null,
    schedule_id = null,
}) => {

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Create Notification
        const [notification] = await notificationModel.create(
            [{ listing_id, enquiry_id, schedule_id, notifiable_type, title, message }],
            { session }
        );

        // 2. Create UserNotification
        const [userNotification] = await userNotificationModel.create(
            [{ notification_id: notification._id, user_id, is_read: false }],
            { session }
        );

        await session.commitTransaction();

        // 3. Emit via socket (only if user is online, otherwise silently skips)
        if (io) {
            io.to(`user:${user_id}`).emit("newNotification", {
                user_notification_id: userNotification._id,
                title,
                message,
                notifiable_type,
                is_read:   false,
                createdAt: userNotification.createdAt
            });
        }

        return { notification, userNotification };

    } catch (err) {
        await session.abortTransaction();
        throw err;

    } finally {
        session.endSession();
    }
};