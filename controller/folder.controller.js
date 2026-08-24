// create an folder 

import folderModel from "../models/folder.model.js";
import folderListingModel from "../models/folderListing.model.js";
import listingModel from "../models/listing.model.js";
import { BadRequestError, NotFoundError } from "../utils/error.utils.js";
import mongoose from "mongoose";
export const create_folder = async ( req , res , next )=>{
    try {
        const { name } = req.body ;
        const user_id = await req.user.sub;
        const folder = await folderModel.create({
            user_id,
            name 
        })
        res.status(201).json({
            folder
        })
    }catch ( err ){
        next( err );
    }
}

// get all folders
export const get_all_folder = async (req, res, next) => {
    try {

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const user_id = req.user.sub;

        const [folders, totalFolders] = await Promise.all([
            folderModel
                .find({ user_id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            folderModel.countDocuments({ user_id })
        ]);

        const totalPages = Math.ceil(totalFolders / limit);

        return res.status(200).json({
            message: "Folders fetched successfully.",
            page,
            totalPages,
            totalFolders,
            folders
        });

    } catch (err) {
        next(err);
    }
};

// add listing to folder

export const add_listing_to_folder = async (req, res, next) => {
    try {

        const { folder_id, listing_id } = req.body;
        const user_id = req.user.sub;

        // Verify folder belongs to current user
        const folder = await folderModel.findOne({
            _id: folder_id,
            user_id
        });

        if (!folder) {
            throw new NotFoundError("Folder not found.");
        }

        // Verify listing exists
        const listing = await listingModel.findById(listing_id);

        if (!listing) {
            throw new NotFoundError("Listing not found.");
        }

        // Check if already added
        const alreadyExists = await folderListingModel.findOne({
            folder_id,
            listing_id
        });

        if (alreadyExists) {
            throw new BadRequestError("Listing already exists in this folder.");
        }

        const folderListing = await folderListingModel.create({
            folder_id,
            listing_id
        });

        return res.status(201).json({
            message: "Listing added to folder successfully.",
            folderListing
        });

    } catch (err) {
        next(err);
    }
};


export const get_folder_listings = async (req, res, next) => {
    try {
        const { folder_id } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const folder_oid = new mongoose.Types.ObjectId(folder_id);
        const folder = await folderModel
            .findById(folder_oid, { folder_name: 1 })
            .lean();

        if (!folder) {
            throw new NotFoundError("Folder not found.");
        }

        const [result] = await folderListingModel.aggregate([

            {
                $match: { folder_id: folder_oid }
            },
            {
                $facet: {
                    listings: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "listings",
                                localField: "listing_id",
                                foreignField: "_id",
                                pipeline: [
                                    {
                                        $project: {
                                            listing_code: 1,
                                            status: 1,
                                            category: 1,
                                            area: 1,
                                            price_sqft: 1,
                                            media_id: 1,
                                            state_id: 1,
                                            deal_type_id: 1,
                                        }
                                    }
                                ],
                                as: "listing"
                            }
                        },
                        { $unwind: "$listing" },
                        {
                            $lookup: {
                                from: "media",
                                localField: "listing.media_id",
                                foreignField: "_id",
                                pipeline: [
                                    {
                                        $project: {
                                            first_image: { $arrayElemAt: ["$media_url", 0] }
                                        }
                                    }
                                ],
                                as: "media"
                            }
                        },
                        {
                            $lookup: {
                                from: "states",
                                localField: "listing.state_id",
                                foreignField: "_id",
                                pipeline: [
                                    { $project: { state: 1 } }
                                ],
                                as: "state"
                            }
                        },
                        {
                            $lookup: {
                                from: "districts",
                                localField: "listing.state_id",
                                foreignField: "state_id",
                                pipeline: [
                                    { $limit: 1 },
                                    { $project: { district: 1 } }
                                ],
                                as: "district"
                            }
                        },
                        {
                            $lookup: {
                                from: "dealtypes",
                                localField: "listing.deal_type_id",
                                foreignField: "_id",
                                pipeline: [
                                    { $project: { name: 1 } }
                                ],
                                as: "deal_type"
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                listing_id: "$listing._id",
                                listing_code: "$listing.listing_code",
                                status: "$listing.status",
                                category: "$listing.category",
                                area: "$listing.area",
                                price_sqft: "$listing.price_sqft",
                                total_price: {
                                    $multiply: [
                                        "$listing.area",
                                        "$listing.price_sqft"
                                    ]
                                },
                                image: {
                                    $arrayElemAt: ["$media.first_image", 0]
                                },
                                state: {
                                    $arrayElemAt: ["$state.state", 0]
                                },
                                district: {
                                    $arrayElemAt: ["$district.district", 0]
                                },
                                deal_type: {
                                    $arrayElemAt: ["$deal_type.name", 0]
                                }
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ], { allowDiskUse: true });
        const totalListings = result.totalCount[0]?.count || 0;
        return res.status(200).json({
            message: "Folder listings fetched successfully.",
            folder_name: folder.folder_name,
            page,
            totalPages: Math.ceil(totalListings / limit),
            totalListings,
            listings: result.listings,
        });
    } catch (err) {
        next(err);
    }
};