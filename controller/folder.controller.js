// create an folder 

import folderModel from "../models/folder.model.js";
import folderListingModel from "../models/folderListing.model.js";
import listingModel from "../models/listing.model.js";
import { BadRequestError, NotFoundError } from "../utils/error.utils.js";

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

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
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

import mongoose from "mongoose";

export const get_folder_listings = async (req, res, next) => {
    try {
        const { folder_id } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Check folder exists
        const folder = await folderModel.findById(folder_id);

        if (!folder) {
            throw new NotFoundError("Folder not found.");
        }

        const result = await folderListingModel.aggregate([

            // Match folder first
            {
                $match: {
                    folder_id: new mongoose.Types.ObjectId(folder_id)
                }
            },

            {
                $facet: {

                    listings: [

                        { $sort: { createdAt: -1 } },

                        { $skip: skip },

                        { $limit: limit },

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

                        // Media
                        {
                            $lookup: {
                                from: "media",
                                localField: "listing.media_id",
                                foreignField: "_id",
                                as: "media"
                            }
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

                                state: "$state.state",

                                district: "$district.district",

                                deal_type: {
                                    $arrayElemAt: [
                                        "$deal_type.name",
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

        const listings = result[0].listings;
        const totalListings = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalListings / limit);

        return res.status(200).json({

            message: "Folder listings fetched successfully.",

            folder_name: folder.folder_name,

            page,

            totalPages,

            totalListings,

            listings

        });

    } catch (err) {
        next(err);
    }
};