import { io } from "socket.io-client";
import dealTypeModel from "../models/dealType.model.js";
import enquiryModel from "../models/enquiry.model.js";
import listingModel from "../models/listing.model.js";
import mediaModel from "../models/media.model.js";
import messageModel from "../models/message.model.js";
import { createAndSendNotification } from "../services/notification.service.js";
import { NotificationTemplates } from "../template/notification.template.js";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/error.utils.js";
import { enquiry_code_generator } from "../utils/unique_code_generator.utils.js";
import mongoose from "mongoose";
// create an enquiry 
export const create_enquiry = async (req, res, next) => {
    try {

        const {
            listing_id,
            interest_type,
            estimated_budget,
            timeLine,
            role,
            message
        } = req.body;
        const user_id = req.user.sub;
        const listing = await listingModel.findOne({
            _id: listing_id,
            status: "active"
        }).select("_id listing_code");
        if (!listing) {
            throw new NotFoundError(
                "Listing not found or is no longer available or not active"
            );
        }

        const existingEnquiry = await enquiryModel.findOne({
            user_id,
            listing_id
        }).select("_id");

        if (existingEnquiry) {
            throw new ConflictError("Enquiry already exists.");
        }

        const enquiry_code = await enquiry_code_generator();

        const enquiry = await enquiryModel.create({
            listing_id,
            interest_type,
            estimated_budget,
            timeLine,
            role,
            enquiry_code,
            user_id
        });

        await messageModel.create({
            enquiry_id: enquiry._id,
            body: message
        });

        // Notification
        const template = NotificationTemplates.enquiryCreated({
            enquiryCode: enquiry.enquiry_code
        });
        const io = req.ap.get("io");
        await createAndSendNotification(io, {
            user_id,
            enquiry_id: enquiry._id,
            notifiable_type: "Enquiry",
            title: template.title,
            message: template.message
        });

        return res.status(201).json({
            message: "Enquiry created successfully.",
            enquiry
        });

    } catch (err) {
        next(err);
    }
};

// get all user enquiry
export const get_all_enquiry = async (req, res, next) => {
    try {

        const page = Math.max(Number(req.query.page) || 1, 1);

        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const user_id = req.user.sub;

        const result = await enquiryModel.aggregate([

            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    status : { $ne : "cancel"}
                }
            },
            {
                $facet: {
                    enquiries: [
                        {
                            $sort: {
                                updatedAt: -1
                            }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        },
                        // Listing
                        {
                            $lookup: {
                                from: "listings",
                                localField: "listing_id",
                                foreignField: "_id",
                                as: "listing"
                            }
                        },
                        {
                            $unwind: "$listing"
                        },
                        // State
                        {
                            $lookup: {
                                from: "states",
                                localField: "listing.state_id",
                                foreignField: "_id",
                                as: "state"
                            }
                        },
                        {
                            $unwind: {
                                path: "$state",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        // District
                        {
                            $lookup: {
                                from: "districts",
                                localField: "listing.state_id",
                                foreignField: "state_id",
                                as: "district"
                            }
                        },
                        {
                            $unwind: {
                                path: "$district",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        // Deal Type
                        {
                            $lookup: {
                                from: "dealtypes",
                                localField: "listing.deal_type_id",
                                foreignField: "_id",
                                as: "deal_type"
                            }
                        },

                        // Media
                        {
                            $lookup: {
                                from: "media",
                                localField: "listing.media_id",
                                foreignField: "_id",
                                as: "media"
                            }
                        },
                        {
                            $project: {
                                enquiry_id: "$_id",
                                enquiry_code: 1,
                                status: 1,
                                updatedAt: 1,
                                listing_id: "$listing._id",
                                unit: "$listing.unit",
                                area: "$listing.area",
                                utilization: "$listing.utilization",
                                state: "$state.state",
                                district: "$district.district",
                                deal_type: "$deal_type.name",
                                image: {
                                    $arrayElemAt: [
                                        {
                                            $arrayElemAt: [
                                                "$media.media_url",
                                                0
                                            ]
                                        },
                                        0
                                    ]
                                }
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
        const enquiries = result[0].enquiries;
        const totalEnquiries = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalEnquiries / limit);
        return res.status(200).json({
            page,
            limit,
            totalPages,
            totalEnquiries,
            enquiries
        });
    } catch (err) {
        next(err);
    }
};
// all enquiry by admin 


export const get_all_enquiry_by_admin = async (req, res, next) => {
    try {

        const  page   = Math.max(Number(req.query.page) || 1 , 1);

        const limit = Math.max(Number(req.query.limit) || 10 , 1);
        const skip = (Number(page) - 1) * limit;

        const result = await enquiryModel.aggregate([

            {
                $facet: {

                    enquiries: [

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

                        // User
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user"
                            }
                        },

                        {
                            $unwind: {
                                path: "$user",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        // Listing
                        {
                            $lookup: {
                                from: "listings",
                                localField: "listing_id",
                                foreignField: "_id",
                                as: "listing"
                            }
                        },

                        {
                            $unwind: {
                                path: "$listing",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $project: {
                                _id: 0,

                                enquiry_id: "$_id",
                                enquiry_code: 1,
                                status: 1,

                                createdAt: 1,
                                updatedAt: 1,

                                listing_id: "$listing._id",
                                listing_code: "$listing.listing_code",

                                fullname: "$user.fullname"
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

        const enquiries = result[0].enquiries;
        const totalEnquiries = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalEnquiries / limit);

        return res.status(200).json({
            page: Number(page),
            limit,
            totalPages,
            totalEnquiries,
            enquiries
        });

    } catch (err) {
        next(err);
    }
};


// change enquiry status by admin
export const change_enquiry_status = async (req, res, next) => {
    try {
        const {  status } = req.body;
        const { enquiry_id } = req.params;
        const enquiry = await enquiryModel.findById(enquiry_id).select(
            "_id enquiry_code user_id status"
        );
        if (!enquiry) {
            throw new NotFoundError("Enquiry not found.");
        }
        if (enquiry.status === status) {
            throw new BadRequestError(
                `Enquiry is already ${status}.`
            );
        }
        const oldStatus = enquiry.status;
        enquiry.status = status;
        await enquiry.save();
        // Notification
        const template = NotificationTemplates.enquiryStatusChanged({
            enquiryCode: enquiry.enquiry_code,
            oldStatus,
            newStatus: status
        });
        const io = req.app.get("io");
        await createAndSendNotification(io,{
            user_id : enquiry.user_id,
            enquiry_id: enquiry._id,
            notifiable_type: "Enquiry",
            title: template.title,
            message: template.message
        });
        return res.status(200).json({
            message: "Enquiry status updated successfully.",
            data: {
                enquiry_id: enquiry._id,
                enquiry_code: enquiry.enquiry_code,
                status: enquiry.status,
                updatedAt: enquiry.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
};

export const get_single_enquiry = async (req, res, next) => {
    try {

        const { enquiry_id } = req.params;

        const enquiry = await enquiryModel.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(enquiry_id),
                }
            },

            // Listing
            {
                $lookup: {
                    from: "listings",
                    localField: "listing_id",
                    foreignField: "_id",
                    as: "listing"
                }
            },
            { $unwind: "$listing" },

            // State
            {
                $lookup: {
                    from: "states",
                    localField: "listing.state_id",
                    foreignField: "_id",
                    as: "state"
                }
            },
            {
                $unwind: {
                    path: "$state",
                    preserveNullAndEmptyArrays: true
                }
            },

            // District
            {
                $lookup: {
                    from: "districts",
                    localField: "listing.state_id",
                    foreignField: "state_id",
                    as: "district"
                }
            },
            {
                $unwind: {
                    path: "$district",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Deal Type
            {
                $lookup: {
                    from: "dealtypes",
                    localField: "listing.deal_type_id",
                    foreignField: "_id",
                    as: "deal_type"
                }
            },

            // Media
            {
                $lookup: {
                    from: "media",
                    localField: "listing.media_id",
                    foreignField: "_id",
                    as: "media"
                }
            },

            // Messages
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "enquiry_id",
                    as: "messages"
                }
            },

            // Users
            {
                $lookup: {
                    from: "users",
                    localField: "messages.sender_id",
                    foreignField: "_id",
                    as: "senders"
                }
            },

            {
                $addFields: {

                    total_price: {
                        $cond: [
                            { $eq: ["$listing.unit", "acres"] },
                            {
                                $multiply: [
                                    "$listing.area",
                                    43560,
                                    "$listing.price_sqft"
                                ]
                            },
                            {
                                $multiply: [
                                    "$listing.area",
                                    "$listing.price_sqft"
                                ]
                            }
                        ]
                    },

                    thumbnail: {
                        $arrayElemAt: [
                            {
                                $arrayElemAt: [
                                    "$media.media_url",
                                    0
                                ]
                            },
                            0
                        ]
                    },

                    messages: {
                        $map: {
                            input: "$messages",
                            as: "msg",
                            in: {
                                message_id: "$$msg._id",
                                message: "$$msg.body",
                                createdAt: "$$msg.createdAt",
                                updatedAt: "$$msg.updatedAt",
                                sender: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$senders",
                                                as: "user",
                                                cond: {
                                                    $eq: [
                                                        "$$user._id",
                                                        "$$msg.sender_id"
                                                    ]
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }

                }
            },

            {
                $project: {

                    _id: 0,

                    enquiry_id: "$_id",
                    enquiry_code: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,

                    listing: {

                        listing_id: "$listing._id",
                        listing_code: "$listing.listing_code",

                        category: "$listing.category",
                        unit: "$listing.unit",
                        area: "$listing.area",

                        price_sqft: "$listing.price_sqft",

                        total_price: "$total_price",

                        utilization: "$listing.utilization",

                        state: "$state.state",

                        district: "$district.district",

                        deal_type: "$deal_type.name",

                        thumbnail: "$thumbnail"
                    },

                    messages: {
                        $map: {
                            input: "$messages",
                            as: "msg",
                            in: {

                                message_id: "$$msg.message_id",

                                message: "$$msg.message",

                                createdAt: "$$msg.createdAt",

                                updatedAt: "$$msg.updatedAt",

                                sender: {

                                    user_id: "$$msg.sender._id",

                                    fullname: "$$msg.sender.fullname",

                                    email: "$$msg.sender.email",

                                    profile_image: "$$msg.sender.profile_image"
                                }

                            }
                        }
                    }

                }
            }

        ]);

        if (!enquiry.length) {
            throw new NotFoundError("Enquiry not found.");
        }

        return res.status(200).json({
            message: "Enquiry fetched successfully.",
            enquiry: enquiry[0]
        });

    } catch (err) {
        next(err);
    }
};

// get geran docs 

export const get_geran_docs_by_enquiry = async (req, res, next) => {
    try {
        const { enquiry_id } = req.params;

        // Get enquiry → listing_id
        const enquiry = await enquiryModel
            .findById(enquiry_id, { listing_id: 1 })
            .lean();

        if (!enquiry) {
            throw new NotFoundError("Enquiry not found.");
        }

        // Get listing → media_id
        const listing = await listingModel
            .findById(enquiry.listing_id, { media_id: 1 })
            .lean();

        if (!listing) {
            throw new NotFoundError("Listing not found.");
        }

        // Get only geran URLs from media
        const media = await mediaModel
            .findOne(
                { _id: { $in: listing.media_id } },
                { media_url: 1, media_type: 1 }
            )
            .lean();

        if (!media) {
            throw new NotFoundError("Media not found.");
        }

        // Filter only geran docs by index
        const geran_urls = media.media_url.filter(
            (_, i) => media.media_type[i] === "document"
        );

        return res.status(200).json({
            success: true,
            message: "Geran documents fetched successfully.",
            data: geran_urls,
        });

    } catch (err) {
        next(err);
    }
};