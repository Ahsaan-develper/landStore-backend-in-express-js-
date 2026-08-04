
import mongoose from "mongoose";
import notificationModel from "../models/notification.model.js";
import userNotificationModel from "../models/userNotificationModel.js";

export const createNotification = async ({
    user_id,
    title,
    message,
    listing_id = null,
    enquiry_id = null,
    schedule_id = null,
    notifiable_type
}) => {

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

        await userNotificationModel.create(
            [{
                notification_id: notification._id,
                user_id
            }],
            { session }
        );

        await session.commitTransaction();

        return notification;

    } catch (err) {

        await session.abortTransaction();
        throw err;

    } finally {

        session.endSession();

    }

};