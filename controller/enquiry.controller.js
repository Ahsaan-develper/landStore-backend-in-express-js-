import dealTypeModel from "../models/dealType.model.js";
import enquiryModel from "../models/enquiry.model.js";
import listingModel from "../models/listing.model.js";
import messageModel from "../models/message.model.js";
import stateModel from "../models/state.model.js";
import { ConflictError, NotFoundError } from "../utils/error.utils.js";
import { enquiry_code_generator } from "../utils/unique_code_generator.utils.js";
import mongoose from "mongoose";
// create an enquiry 
export const create_enquiry = async ( req , res , next )=>{
    try {
        const { listing_id , interest_type , estimated_budget , timeLine , role , message} = req.body ;
        const user_id = req.user.sub;
        const enquiry_code = await enquiry_code_generator();
        const existing_enquiry = await enquiryModel.findOne({ user_id  , listing_id}).select("user_id listing_id");
        if( existing_enquiry ) throw new ConflictError(" Enquiry already added");
        const enquiry = await enquiryModel.create({
            listing_id , interest_type , estimated_budget , timeLine , role  , enquiry_code , user_id
        });
        const new_message = await messageModel.create({ body : message  , enquiry_id : enquiry._id })
        res.status(201).json({
            enquiry , message
        });
    }catch ( err ){
        next ( err );
    }
}

// get all user enquiry 
export const get_all_enquiry = async (req, res, next) => {
    try {

        const page = Math.max(Number(req.body.page) || 1, 1);

        const limit = 10;
        const skip = (page - 1) * limit;

        const user_id = req.user.sub;

        const result = await enquiryModel.aggregate([

            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id)
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
                                _id: 0,

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

        const  page   = Number(req.body.page)|| 1;

        const limit = 10;
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

        const { enquiry_id, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(enquiry_id)) {
            throw new BadRequestError("Invalid enquiry id.");
        }

        const enquiry = await enquiryModel.findById(enquiry_id).select("status _id");

        if (!enquiry) {
            throw new NotFoundError("Enquiry not found.");
        }

        enquiry.status = status;

        await enquiry.save();

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

