import mongoose from "mongoose";
import listingModel from "../models/listing.model.js";

export const get_listing_details = async (listing_id) => {

    if (!mongoose.Types.ObjectId.isValid(listing_id)) {
        return null;
    }

    const listing = await listingModel.aggregate([

        {
            $match: {
                _id: new mongoose.Types.ObjectId(listing_id)
            }
        },

        // Owner
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
            }
        },

        {
            $unwind: "$user"
        },

        // State
        {
            $lookup: {
                from: "states",
                localField: "state_id",
                foreignField: "_id",
                as: "state"
            }
        },

        {
            $unwind: "$state"
        },

        // District
        {
            $lookup: {
                from: "districts",
                localField: "state_id",
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

        // Sub district
        {
            $lookup: {
                from: "subdistricts",
                localField: "district._id",
                foreignField: "district_id",
                as: "sub_district"
            }
        },

        {
            $unwind: {
                path: "$sub_district",
                preserveNullAndEmptyArrays: true
            }
        },

        // Location
        {
            $lookup: {
                from: "locations",
                localField: "location_id",
                foreignField: "_id",
                as: "location"
            }
        },

        {
            $unwind: "$location"
        },

        // Media
        {
            $lookup: {
                from: "media",
                localField: "media_id",
                foreignField: "_id",
                as: "media"
            }
        },

        // Deal types
        {
            $lookup: {
                from: "dealtypes",
                localField: "deal_type_id",
                foreignField: "_id",
                as: "deal_types"
            }
        },

        // Feature tags
        {
            $lookup: {
                from: "featuretags",
                localField: "feature_tags_id",
                foreignField: "_id",
                as: "feature_tags"
            }
        },

        // Terrain
        {
            $lookup: {
                from: "terraintypes",
                localField: "terrain_id",
                foreignField: "_id",
                as: "terrain"
            }
        },

        // Tenure
        {
            $lookup: {
                from: "tenuretypes",
                localField: "tenure_id",
                foreignField: "_id",
                as: "tenure"
            }
        },

        {
            $unwind: "$tenure"
        },

        // Leasehold
        {
            $lookup: {
                from: "leaseholds",
                localField: "tenure.leasehold_id",
                foreignField: "_id",
                as: "leasehold"
            }
        },

        {
            $unwind: {
                path: "$leasehold",
                preserveNullAndEmptyArrays: true
            }
        },

        // Price
        {
            $addFields: {
                total_price: {
                    $multiply: ["$area", "$price_sqft"]
                }
            }
        },

        // Listing activity
        {
            $lookup: {
                from: "listingactivities",
                localField: "_id",
                foreignField: "listing_id",
                as: "activity"
            }
        },

        {
            $addFields: {
                total_views: {
                    $sum: "$activity.view_count"
                },

                total_clicks: {
                    $sum: "$activity.click_count"
                }
            }
        },

        // Final response
        {
            $project: {

                _id: 0,

                listing_id: "$_id",
                listing_code: 1,

                status: 1,
                unit: 1,
                area: 1,
                price_sqft: 1,
                total_price: 1,

                category: 1,
                relation: 1,
                utilization: 1,

                public_description: 1,

                is_malay_reserve_land: 1,

                createdAt: 1,
                updatedAt: 1,

                total_views: 1,
                total_clicks: 1,

                owner: {
                    user_id: "$user._id",
                    fullname: "$user.fullname",
                    email: "$user.email",
                    phone_number: "$user.phone_number",
                    role: "$user.role"
                },

                state: "$state.state",

                district: "$district.district",

                sub_district: "$sub_district.sub_district",

                location: {
                    longitude: "$location.longitude",
                    latitude: "$location.latitude",
                    radius: "$location.radius"
                },

                media: {
                    media_url: "$media.media_url",
                    public_id: "$media.public_id"
                },

                deal_types: "$deal_types.name",

                feature_tags: "$feature_tags.tag",

                terrain: "$terrain.name",

                tenure: "$tenure.type",

                leasehold: {
                    start_date: "$leasehold.start_date",
                    end_year: "$leasehold.end_year"
                }
            }
        }

    ]);

    return listing[0] || null;
};


import enquiryModel from "../models/enquiry.model.js";

export const get_enquiry_details = async (enquiry_id) => {

    if (!mongoose.Types.ObjectId.isValid(enquiry_id)) {
        return null;
    }
    const enquiry = await enquiryModel.aggregate([

        // Enquiry
        {
            $match: {
                _id: new mongoose.Types.ObjectId(enquiry_id)
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

        // Messages
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "enquiry_id",
                as: "messages"
            }
        },

        // Message senders
        {
            $lookup: {
                from: "users",
                localField: "messages.sender_id",
                foreignField: "_id",
                as: "senders"
            }
        },

        // Calculated fields
        {
            $addFields: {

                total_price: {
                    $cond: [
                        {
                            $eq: [
                                "$listing.unit",
                                "acres"
                            ]
                        },
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
                        "$media.media_url",
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

        // Final shape
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

                                profile_image:
                                    "$$msg.sender.profile_image"
                            }
                        }
                    }
                }
            }
        }
    ]);

    return enquiry[0] || null;
};