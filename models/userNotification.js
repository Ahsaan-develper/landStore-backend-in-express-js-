import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema({
  notification_id: { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  is_read: { type: Boolean, default: false },
  read_at: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("UserNotification", userNotificationSchema);