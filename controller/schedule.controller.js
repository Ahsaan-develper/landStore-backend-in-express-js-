import mongoose from "mongoose";
import enquiryModel from "../models/enquiry.model.js";
import scheduleModel from "../models/schedule.model.js";
import { BadRequestError, NotFoundError } from "../utils/error.utils.js";


// make schedule
export const make_schedule = async (req, res, next) => {
    try {
        const {
            enquiry_id,
            visit_date,
            visit_address,
            notes
        } = req.body;

        const admin_id = req.user.sub;

        // Check enquiry exists
        const enquiry = await enquiryModel.findById(enquiry_id);

        if (!enquiry) {
            throw new NotFoundError("Enquiry not found.");
        }

        // Prevent duplicate active schedule
        const existingSchedule = await scheduleModel.findOne({
            enquiry_id,
            status: "scheduled"
        });

        if (existingSchedule) {
            throw new BadRequestError("A schedule already exists for this enquiry.");
        }

        // Future date only
        if (new Date(visit_date) <= new Date()) {
            throw new BadRequestError("Visit date must be in the future.");
        }

        const schedule = await scheduleModel.create({
            enquiry_id,
            admin_id,
            visit_date,
            visit_address,
            scheduled_date_time : new Date(),
            notes
        });

        return res.status(201).json({
            message: "Visit scheduled successfully.",
            schedule: {
                schedule_id: schedule._id,
                enquiry_id: schedule.enquiry_id,
                admin_id: schedule.admin_id,
                visit_date: schedule.visit_date,
                visit_address: schedule.visit_address,
                notes: schedule.notes,
                status: schedule.status
            }
        });

    } catch (err) {
        next(err);
    }
};


export const change_schedule_status = async (req, res, next) => {
    try {

        const { schedule_id, status } = req.body;

        // Check existing schedule
        const existingSchedule = await scheduleModel
            .findById(schedule_id)
            .select("status");

        if (!existingSchedule) {
            throw new NotFoundError("Schedule not found.");
        }

        // Prevent unnecessary update
        if (existingSchedule.status === status) {
            return res.status(200).json({
                message: "Schedule already has this status.",
                data: {
                    schedule_id,
                    status
                }
            });
        }

        // Update status
        const updatedSchedule = await scheduleModel.findByIdAndUpdate(
            schedule_id,
            {
                $set: {
                    status
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("_id status updatedAt");

        return res.status(200).json({
            message: "Schedule status updated successfully.",
            data: {
                schedule_id: updatedSchedule._id,
                status: updatedSchedule.status,
                updatedAt: updatedSchedule.updatedAt
            }
        });

    } catch (err) {
        next(err);
    }
};


// get schedule of an enquiry


export const get_enquiry_schedule = async (req, res, next) => {
    try {

        const { enquiry_id } = req.params;

        const schedules = await scheduleModel.aggregate([

            {
                $match: {
                    enquiry_id: new mongoose.Types.ObjectId(enquiry_id)
                }
            },

            // Admin Details
            {
                $lookup: {
                    from: "users",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "admin"
                }
            },

            {
                $unwind: {
                    path: "$admin",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $project: {
                    _id: 0,

                    schedule_id: "$_id",
                    enquiry_id: 1,

                    visit_date: 1,
                    visit_address: 1,
                    scheduled_date_time: 1,

                    notes: 1,
                    status: 1,

                    createdAt: 1,
                    updatedAt: 1,

                    admin: {
                        admin_id: "$admin._id",
                        fullname: "$admin.fullname",
                        email: "$admin.email",
                        role: "$admin.role"
                    }
                }
            },

            {
                $sort: {
                    visit_date: -1
                }
            }

        ]);

        if (!schedules.length) {
            throw new NotFoundError("No schedule found for this enquiry.");
        }

        return res.status(200).json({
            enquiry_id,
            totalSchedules: schedules.length,
            schedules
        });

    } catch (err) {
        next(err);
    }
};