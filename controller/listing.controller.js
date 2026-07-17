import { BadRequestError, InternalServerError, NotFoundError } from "../middleware/error.middleware.js"
import imagesModel from "../models/images.model.js";
import listingModel from "../models/listing.model.js";
import { deleteFromCloudinary, upload_to_cloudinary } from "../services/cloudinary.js";
import { calculatePrice } from "../utils/calculate price.js";
import { getCoordinates } from "../utils/getCoordinates.js";
import mongoose from "mongoose";

export const create_listing = async (req, res) => {
    try {
        const {
            unit, area, public_description, price_sqft,
            is_malay_reserve_land, sub_district, district,
            section, lot_number, tenure_type, start_date,
            end_year, dealType, category,
            state, feature_tags, terrain, relation, utilization,
        } = req.body;
        if ( tenure_type === "leasehold" && (!start_date || !end_year))  throw new BadRequestError(" Starting date and end year is required ");


        const user_id = req.user.sub;

        const geran_files = req.files?.["geran_img"] || [];
        if (geran_files.length === 0) {
            throw new BadRequestError("Please upload at least one geran image");
        }

        const property_files = req.files?.["property_images"] || [];
        if (property_files.length < 3 || property_files.length > 15) {
            throw new BadRequestError("Min 3 and max 15 property images are required");
        }

        const [coords, ...allUploads] = await Promise.all([
            getCoordinates(district, state),
            ...geran_files.map((file) => upload_to_cloudinary(file.buffer, "geran_images")),
            ...property_files.map((file) => upload_to_cloudinary(file.buffer, "property_images")),
        ]);

        const geranUploads = allUploads.slice(0, geran_files.length);
        const propertyUploads = allUploads.slice(geran_files.length);
        
        const thumbnail_img = propertyUploads[0];
        const thumbnail = {
            url:       thumbnail_img.url,
            public_id: thumbnail_img.public_id
        };
         const price =calculatePrice(area , unit , price_sqft)

        const listing = await listingModel.create({
            unit, area, public_description, price_sqft,
            is_malay_reserve_land, sub_district, district,
            section, lot_number, tenure_type, start_date,
            end_year, thumbnail, status: "pending",
            latitude:  coords.latitude,
            longitude: coords.longitude,
            price,
            location:  coords.location,
            dealType, category, state, feature_tags,
            published_type: "published",
            terrain, relation, utilization, user_id,
        });

        const imageDocs = [];

        if (geranUploads.length > 0) {
            geranUploads.forEach((result) => {
                imageDocs.push({
                    img: {
                        url:       result.url,
                        public_id: result.public_id,
                    },
                    listing_id: listing._id,
                    type:       "geran", 
                });
            });
        }


        propertyUploads.slice(1).forEach((result) => {
            imageDocs.push({
                img: {
                    url:       result.url,
                    public_id: result.public_id,
                },
                listing_id: listing._id,
                type:       "property",
            });
        });

        if (imageDocs.length > 0) {
            await imagesModel.insertMany(imageDocs);
        }

        return res.status(201).json({
            success: true,
            message: "Listing created successfully",
            data: listing,
            price : `RM  ${price}`
        });

    } catch (err) {
        if (err instanceof BadRequestError) throw err;
        throw new InternalServerError(err.message);
    }
};


// create listing draft 
export const create_listing_draft = async (req, res) => {
    try {
        const {
            unit, area, public_description, price_sqft,
            is_malay_reserve_land, sub_district, district,
            section, lot_number, tenure_type, start_date,
            end_year, dealType, category,
            state, feature_tags, terrain, relation, utilization,
        } = req.body;


        const user_id = req.user.sub;
        const geran_files = req.files?.["geran_img"] || [];

        const property_files = req.files?.["property_images"] || [];
        if (property_files.length < 3 || property_files.length > 15) {
            throw new BadRequestError("Min 3 and max 15 property images are required");
        }

        const [coords, ...allUploads] = await Promise.all([
            getCoordinates(district, state),
            ...geran_files.map((file) => upload_to_cloudinary(file.buffer, "geran_images")),
            ...property_files.map((file) => upload_to_cloudinary(file.buffer, "property_images")),
        ]);

        const geranUploads = allUploads.slice(0, geran_files.length);
        const propertyUploads = allUploads.slice(geran_files.length);
        
        const thumbnail_img = propertyUploads[0];
        const thumbnail = {
            url:       thumbnail_img.url,
            public_id: thumbnail_img.public_id
        };
         const price =calculatePrice(area , unit , price_sqft)

        const listing = await listingModel.create({
            unit, area, public_description, price_sqft,
            is_malay_reserve_land, sub_district, district,
            section, lot_number, tenure_type, start_date,
            end_year, thumbnail, status: "pending",
            latitude:  coords.latitude,
            longitude: coords.longitude,
            location:  coords.location,
            price,
            dealType, category, state, feature_tags,
            published_type: "draft",
            terrain, relation, utilization, user_id,
        });

        const imageDocs = [];

        if (geranUploads.length > 0) {
            geranUploads.forEach((result) => {
                imageDocs.push({
                    img: {
                        url:       result.url,
                        public_id: result.public_id,
                    },
                    listing_id: listing._id,
                    type:       "geran", 
                });
            });
        }


        propertyUploads.slice(1).forEach((result) => {
            imageDocs.push({
                img: {
                    url:       result.url,
                    public_id: result.public_id,
                },
                listing_id: listing._id,
                type:       "property",
            });
        });

        if (imageDocs.length > 0) {
            await imagesModel.insertMany(imageDocs);
        }

        return res.status(201).json({
            success: true,
            message: "Listing created successfully",
            data: listing,
            price : `RM  ${price}`
        });

    } catch (err) {
        if (err instanceof BadRequestError) throw err;
        throw new InternalServerError(err.message);
    }
};




export const get_all_draft = async (req, res) => {
    try {
        const { page = 1 } = req.body;
        const limit =  3;
        const skip = (Number(page) - 1) * limit;
        const user_id = req.user.sub;

        const listings = await listingModel.aggregate([
            { 
                $match: { 
                    published_type: "draft",
                    user_id: new mongoose.Types.ObjectId(user_id) 
                } 
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        return res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err);
    }
};







export const get_all_pending_listing = async (req, res) => {
    try {
        const { page = 1 } = req.body;
        const limit =  3;
        const skip = (Number(page) - 1) * limit;
        const user_id = req.user.sub;

         const [listings, total] = await Promise.all([
            listingModel
                .find({ status: "pending", user_id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            listingModel.countDocuments({ status: "pending", user_id })
        ]);

        return res.status(200).json({
            success: true,
            count: listings.length,
             total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err);
    }
};



// in active listing
export const get_all_inactive_listing = async (req, res) => {
    try {
        const { page = 1 } = req.body;
        const limit =  3;
        const skip = (Number(page) - 1) * limit;
        const user_id = req.user.sub;

         const [listings, total] = await Promise.all([
            listingModel
                .find({ status: "inactive", user_id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            listingModel.countDocuments({ status: "inactive", user_id })
        ]);

        return res.status(200).json({
            success: true,
            count: listings.length,
             total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err);
    }
};


// in active listing
export const get_all_active_listing = async (req, res) => {
    try {
        const { page = 1 } = req.body;
        const limit =  3;
        const skip = (Number(page) - 1) * limit;
        const user_id = req.user.sub;

         const [listings, total] = await Promise.all([
            listingModel
                .find({ status: "active", user_id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            listingModel.countDocuments({ status: "active", user_id })
        ]);

        return res.status(200).json({
            success: true,
            count: listings.length,
             total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err);
    }
};

// get all under review listing 

export const get_all_under_review_listing = async (req, res) => {
    try {
        const { page = 1 } = req.body;
        const limit =  3;
        const skip = (Number(page) - 1) * limit;
        const user_id = req.user.sub;

         const [listings, total] = await Promise.all([
            listingModel
                .find({ status: "under review", user_id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            listingModel.countDocuments({ status: "under review", user_id })
        ]);

        return res.status(200).json({
            success: true,
            count: listings.length,
             total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err);
    }
};



// get all listings 

export const get_all_listing = async ( req , res )=>{
    try {
        const { page } = req.body ;
        const limit = 3 ;
        let user_id = req.user.sub;
        let skip =(Number(page) - 1) * limit;
        const listings = await listingModel.find({ user_id}).sort({ updatedAt : -1 }).skip(skip).limit(limit).lean()
        if ( !listings ) throw new NotFoundError(" No listing is found ");
        res.status(200).json({
            listings
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}

// get a single listing  full detail
export const get_single_listing = async ( req , res )=>{
    try {
        const { id } = req.params;
    const [listing, images] = await Promise.all([
    listingModel.findById(id).lean(),
    imagesModel.find({ listing_id: id }).lean()
]);
    if ( !listing ) throw new NotFoundError("Listing not found")
res.status(200).json({
    listing,
    images
})
    }catch ( err ){
        throw new InternalServerError( err );
    }
}



//update an listing

export const update_draft = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.sub;


        const existing = await listingModel.findOne({ _id: id, user_id });
        if (!existing) throw new NotFoundError("Draft not found");

        const body = req.body || {};
        let updated_data = {};

        const addIfPresent = (field) => {
            if (body[field] !== undefined && body[field] !== "") {
                updated_data[field] = body[field];
            }
        };

        // List all updatable fields
        [
            "unit", "area", "public_description", "price_sqft",
            "is_malay_reserve_land", "sub_district", "district",
            "section", "lot_number", "tenure_type", "start_date",
            "end_year", "dealType", "category", "state",
            "feature_tags", "terrain", "relation", "utilization",
            "published_type"
        ].forEach(addIfPresent);

        // Recalculate coordinates if location changed
        if (body.district || body.state) {
            const newDistrict = body.district || existing.district;
            const newState = body.state || existing.state;

            if (newDistrict !== existing.district || newState !== existing.state) {
                const coords = await getCoordinates(newDistrict, newState);
                updated_data.latitude = coords.latitude;
                updated_data.longitude = coords.longitude;
                updated_data.location = coords.location;
                updated_data.district = newDistrict;
                updated_data.state = newState;
            }
        }

        // Handle new geran image (optional)
        const geran_file = req.files?.["geran_img"]?.[0];
        if (geran_file) {
            const geran_upload = await upload_to_cloudinary(geran_file.buffer, "geran_images");
            updated_data.geran_img = {
                url: geran_upload.url,
                public_id: geran_upload.public_id,
                geran: "geran"
            };
        }


        // Only update if there's data
        if (Object.keys(updated_data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update"
            });
        }

        const updated = await listingModel.findByIdAndUpdate(
            id,
            { $set: updated_data },
            { new: true, runValidators: true }
        );
        // Handle property images (optional)

        const property_files = req.files?.["property_images"] || [];
        if (property_files.length > 0) {
            const uploadedImages = await Promise.all(
                property_files.map(file => upload_to_cloudinary(file.buffer, "property_images"))
            );
            const imageDocs = uploadedImages.map(result => ({
                img: { url: result.url, public_id: result.public_id },
                listing_id: id
            }));
            await imagesModel.insertMany(imageDocs);
        }

        return res.status(200).json({
            success: true,
            message: "Draft updated",
            data: updated
        });

    } catch (err) {
        if (err instanceof BadRequestError || err instanceof NotFoundError) throw err;
        throw new InternalServerError(err.message);
    }
};

// make a draft published 
export const change_listing_status_by_admin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await listingModel.findByIdAndUpdate(
            id,
            { $set: { status } },
                 { new: true, runValidators: true }
        );

        if (!updated) throw new NotFoundError("Listing not found");

        return res.status(200).json({
            success: true,
            message: `Status updated to ${status}`,
            data: updated
        });

    } catch (err) {
        throw new InternalServerError(err.message);
    }
};

export const delete_listing = async (req, res) => {
    try {
        const { id } = req.params;

        const [listing, images] = await Promise.all([
            listingModel.findById(id).lean(),
            imagesModel.find({ listing_id: id }).lean()
        ]);

        if (!listing) throw new NotFoundError("Listing not found");

        const publicIds = [];

        if (listing.thumbnail?.public_id) {
            publicIds.push(listing.thumbnail.public_id);
        }

        images.forEach(img => {
            if (img.img?.public_id) publicIds.push(img.img.public_id);
        });

        const deleteOps = [
            listingModel.findByIdAndDelete(id),
            imagesModel.deleteMany({ listing_id: id })
        ];

        if (publicIds.length > 0) {
            deleteOps.push(
                Promise.all(publicIds.map(pid => deleteFromCloudinary(pid)))
            );
        }

        await Promise.all(deleteOps);

        return res.status(200).json({
            success: true,
            message: "Listing and all media deleted successfully",
        });

    } catch (err) {
        if (err instanceof BadRequestError || err instanceof NotFoundError) throw err;
        throw new InternalServerError(err.message);
    }
};

// get all listing by admin

export const get_all_listing_by_admin = async (req, res) => {
    try {
        const { 
            page = 1, 
            status, 
            category,
            startDate,
            endDate,
            published_type = "published"
        } = req.body;
        
        const limit = 10;
        const skip = (Number(page) - 1) * limit;

        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (published_type) filter.published_type =published_type;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [listings, total] = await Promise.all([
            listingModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            listingModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            count: listings.length,
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err.message);
    }
};




export const get_filtered_listings = async (req, res) => {
    try {
        const {
            page = 1,
            state,
            district,
            dealType,                 
            category,               
            terrain,                  
            utilization,              
            is_malay_reserve_land,   
            minArea = 0,            
            maxArea = 100,            
            areaUnit = "acres",      
            minPrice,                
            maxPrice,                
            tenure_type,             
            search,                   
            sortBy = "createdAt",     
            sortOrder = "desc",
        } = req.body;

        const limit = 10;
        const skip = (Number(page) - 1) * limit;

        const filter = { published_type: "published", status: "active" };

        if (state) filter.state = state;
        if (district) filter.district = district;

        if (dealType) {
            filter.dealType = Array.isArray(dealType) 
                ? { $in: dealType } 
                : dealType;
        }
        // Category
        if (category) filter.category = category;

        if (terrain) {
            filter.terrain = Array.isArray(terrain)
                ? { $in: terrain }
                : terrain;
        }

        if (utilization) filter.utilization = utilization;

        if (is_malay_reserve_land !== undefined && is_malay_reserve_land !== "both") {
            filter.is_malay_reserve_land = is_malay_reserve_land === "yes" || is_malay_reserve_land === true;
        }

        if (minArea !== undefined || maxArea !== undefined) {
            filter.area = {};
            if (minArea !== undefined) filter.area.$gte = Number(minArea);
            if (maxArea !== undefined) filter.area.$lte = Number(maxArea);

            if (areaUnit) filter.unit = areaUnit;
        }

        // Price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price_sqft = {};
            if (minPrice) filter.price_sqft.$gte = String(minPrice);
            if (maxPrice) filter.price_sqft.$lte = String(maxPrice);
        }

        // Tenure type
        if (tenure_type) filter.tenure_type = tenure_type;

        // Text search
        if (search) {
            filter.$or = [
                { public_description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { district: { $regex: search, $options: "i" } }
            ];
        }

        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [listings, total] = await Promise.all([
            listingModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            listingModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            count: listings.length,
            filters_applied: Object.keys(filter),
            data: listings
        });

    } catch (err) {
        throw new InternalServerError(err.message);
    }
};