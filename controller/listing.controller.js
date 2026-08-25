import mongoose from "mongoose";
import listingModel      from "../models/listing.model.js";
import mediaModel        from "../models/media.model.js";
import dealTypeModel     from "../models/dealType.model.js";
import featureTagModel   from "../models/featureTags.model.js";
import terrainTypeModel  from "../models/terrainType.model.js";
import tenureTypeModel   from "../models/tenureType.model.js";
import leaseholdDetailModel from "../models/leasehold.model.js";
import stateModel        from "../models/state.model.js";
import { BadRequestError, NotFoundError } from "../utils/error.utils.js";
import { listing_code_generator } from "../utils/unique_code_generator.utils.js";
import districtModel from "../models/district.model.js";
import subDistrictModel from "../models/subDistrict.model.js";
import locationModel from "../models/location.model.js";
import {delete_file, delete_files_from_cloudinary, upload_files_to_cloudinary} from "../services/cloudinary.service.js"
import { NotificationTemplates } from "../template/notification.template.js";
import { createAndSendNotification } from "../services/notification.service.js";
import enquiryModel from "../models/enquiry.model.js";
import notesModel from "../models/notes.model.js";


export const create_listing = async (req, res, next) => {
    try {
        const {
            unit, area, public_description, price_sqft,
            is_malay_reserve_land, tenure_type, start_date,
            end_year, dealType, category,
            state_name, longitude, latitude,
            district_name, sub_district_name, session,
            feature_tags, terrain, relation, utilization,
        } = req.body;

        const user_id         = req.user.sub;
        console.log("user od " , user_id);
        
        const property_images = req.files?.property_images || [];
        const geran_docs      = req.files?.geran_doc       || [];

        if (property_images.length < 3) throw new BadRequestError("At least three property images are required");
        if (geran_docs.length < 1)      throw new BadRequestError("Geran document is required");

      const [image_uploads, doc_uploads] = await Promise.all([
    upload_files_to_cloudinary(property_images, "listings/images"),
    upload_files_to_cloudinary(geran_docs, "listings/geran/documents"),
]);

   
        const state_doc = await stateModel.create({ state: state_name });

        const district_doc = await districtModel.create({
            state_id : state_doc._id,
            district : district_name,
        });

        const sub_district_doc = await subDistrictModel.create({
            district_id : district_doc._id,
            sub_district: sub_district_name,
            session,
        });


        const deal_types   = Array.isArray(dealType)     ? dealType     : [dealType];
        const tags         = Array.isArray(feature_tags) ? feature_tags : [feature_tags];
        const terrain_list = Array.isArray(terrain)      ? terrain      : [terrain];

   
        const [
            media_doc,
            deal_type_doc,
            feature_tag_doc,
            terrain_doc,
            location_doc,
            leasehold_doc,
            listing_code,
        ] = await Promise.all([
            mediaModel.create({
                media_url  : [
                    ...image_uploads.map(r => r.url),
                    ...doc_uploads.map(r => r.url),
                ],
                public_id  : [
                    ...image_uploads.map(r => r.public_id),
                    ...doc_uploads.map(r => r.public_id),
                ],
                media_type : [
                    ...image_uploads.map(() => "image"),
                    ...doc_uploads.map(() => "document"),
                ],
                media_name : [
                    ...property_images.map(f => f.originalname),
                    ...geran_docs.map(f => f.originalname),
                ],
            }),
            dealTypeModel.create({ name: deal_types }),
            featureTagModel.create({ tag: tags }),
            terrainTypeModel.create({ name: terrain_list }),
            locationModel.create({
                location: {
                    type        : "Point",
                    coordinates : [parseFloat(longitude), parseFloat(latitude)],
                }
            }),
            tenure_type === "leasehold"
                ? leaseholdDetailModel.create({ start_date, end_year })
                : null,
            listing_code_generator(),
        ]);
        const tenure_doc = await tenureTypeModel.create({
            type         : tenure_type,
            leasehold_id : leasehold_doc?._id ?? null,
        });
        const listing = await listingModel.create({
            user_id,
            state_id        : state_doc._id,
            tenure_id       : tenure_doc._id,
            location_id     : location_doc._id,
            media_id        : [media_doc._id],
            deal_type_id    : [deal_type_doc._id],
            feature_tags_id : [feature_tag_doc._id],
            terrain_id      : [terrain_doc._id],
            status          : "pending",
            listing_code    ,
            public_description,
            is_malay_reserve_land : is_malay_reserve_land === "true" || is_malay_reserve_land === true,
            unit,
            area            : parseFloat(area),
            price_sqft      : parseFloat(price_sqft),
            category,
            relation       ,
            utilization     ,
        });
        const { title , message} =NotificationTemplates.listingSubmitted({
            listingCode : listing.listing_code,
            state : state_doc.state,
            district : district_doc.district,
            status : "pending"
        })
        const io = req.app.get("io");
        await createAndSendNotification(io,{
    user_id: listing.user_id,
    listing_id: listing._id,
    notifiable_type: "Listing",
    title,
    message
});
        return res.status(201).json({
            data: {
                _id          : listing._id,
                listing_code : listing.listing_code,
                status       : listing.status,
            }
        });

    } catch (err) {
          console.error(err);
        next(err);
    }
};

// change listing status from pending to draft


export const make_draft_by_user = async (req, res, next) => {
    const dbSession = await mongoose.startSession();

    try {
        const {
            unit,
            area,
            public_description,
            price_sqft,
            is_malay_reserve_land,
            tenure_type,
            start_date,
            end_year,
            dealType,
            category,
            state_name,
            longitude,
            latitude,
            district_name,
            sub_district_name,
            session,
            feature_tags,
            terrain,
            relation,
            utilization,
        } = req.body;

        const user_id = req.user.sub;

        const property_images = req.files?.property_images || [];
        const geran_docs = req.files?.geran_doc || [];

        // At least 3 property images are required
        if (property_images.length < 3) {
            throw new BadRequestError(
                "At least three property images are required."
            );
        }

        // Upload property images (outside transaction — no DB lock needed)
        const image_uploads = await upload_files_to_cloudinary(
            property_images,
            "listings/images"
        );

        // Upload geran only if provided (outside transaction)
        let doc_uploads = [];
        if (geran_docs.length > 0) {
            doc_uploads = await upload_files_to_cloudinary(
                geran_docs,
                "listings/documents"
            );
        }

        // Generate listing code outside transaction — no lock needed
        const listing_code = await listing_code_generator();

        const deal_types = Array.isArray(dealType) ? dealType : [dealType];
        const tags = Array.isArray(feature_tags) ? feature_tags : [feature_tags];
        const terrain_list = Array.isArray(terrain) ? terrain : [terrain];

        // ── Start transaction only for DB writes ──────────────────────────
        dbSession.startTransaction();

        // Create location hierarchy (sequential — each depends on prior _id)
        const state_doc = await stateModel.create(
            [{ state: state_name }],
            { session: dbSession }
        );

        const district_doc = await districtModel.create(
            [{ state_id: state_doc[0]._id, district: district_name }],
            { session: dbSession }
        );

        await subDistrictModel.create(
            [
                {
                    district_id: district_doc[0]._id,
                    sub_district: sub_district_name,
                    session,
                },
            ],
            { session: dbSession }
        );

        // Create all independent documents in parallel
        const [
            media_doc,
            deal_type_doc,
            feature_tag_doc,
            terrain_doc,
            location_doc,
            leasehold_doc,
        ] = await Promise.all([
            mediaModel.create(
                [
                    {
                        media_url: [
                            ...image_uploads.map((file) => file.url),
                            ...doc_uploads.map((file) => file.url),
                        ],
                        public_id: [
                            ...image_uploads.map((file) => file.public_id),
                            ...doc_uploads.map((file) => file.public_id),
                        ],
                        media_type: [
                            ...image_uploads.map(() => "image"),
                            ...doc_uploads.map(() => "geran"),
                        ],
                        media_name: [
                            ...property_images.map((file) => file.originalname),
                            ...geran_docs.map((file) => file.originalname),
                        ],
                    },
                ],
                { session: dbSession }
            ),

            dealTypeModel.create(
                [{ name: deal_types }],
                { session: dbSession }
            ),

            featureTagModel.create(
                [{ tag: tags }],
                { session: dbSession }
            ),

            terrainTypeModel.create(
                [{ name: terrain_list }],
                { session: dbSession }
            ),

            locationModel.create(
                [
                    {
                        location: {
                            type: "Point",
                            coordinates: [
                                parseFloat(longitude),
                                parseFloat(latitude),
                            ],
                        },
                    },
                ],
                { session: dbSession }
            ),

            tenure_type === "leasehold"
                ? leaseholdDetailModel.create(
                    [{ start_date, end_year }],
                    { session: dbSession }
                )
                : Promise.resolve([null]),
        ]);

        const tenure_doc = await tenureTypeModel.create(
            [
                {
                    type: tenure_type,
                    leasehold_id: leasehold_doc?.[0]?._id || null,
                },
            ],
            { session: dbSession }
        );

        // Create Draft Listing
        const listing = await listingModel.create(
            [
                {
                    user_id,
                    tenure_id: tenure_doc[0]._id,
                    location_id: location_doc[0]._id,
                    state_id: state_doc[0]._id,
                    media_id: [media_doc[0]._id],
                    deal_type_id: [deal_type_doc[0]._id],
                    feature_tags_id: [feature_tag_doc[0]._id],
                    terrain_id: [terrain_doc[0]._id],

                    status: "draft",

                    listing_code,

                    public_description,

                    is_malay_reserve_land:
                        is_malay_reserve_land === true ||
                        is_malay_reserve_land === "true",

                    unit,
                    area: Number(area),
                    price_sqft: Number(price_sqft),

                    category,
                    relation,
                    utilization,
                },
            ],
            { session: dbSession }
        );

        await dbSession.commitTransaction();
        const { title, message } = NotificationTemplates.listingDraftSaved({
            listingCode: listing[0].listing_code,
            state: state_doc[0].state,
            district: district_doc[0].district,
            status: "pending",
        });
        const io = req.app.get("io");
        await createAndSendNotification(io, {
            user_id: listing[0].user_id,
            listing_id: listing[0]._id,
            notifiable_type: "Listing",
            title,
            message,
        });
        return res.status(201).json({
            success: true,
            message: "Draft saved successfully.",
            data: {
                _id: listing[0]._id,
                listing_code: listing[0].listing_code,
                status: listing[0].status,
            },
        });

    } catch (err) {
        if (dbSession.inTransaction()) {
            await dbSession.abortTransaction();
        }
        console.error(err);
        next(err);
    } finally {
        dbSession.endSession();
    }
};



export const get_listing_by_user = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const userId = new mongoose.Types.ObjectId(req.user.sub);
        const [result] = await listingModel.aggregate([
            {
                $match: {
                    user_id: userId ,
                    status : { $ne : "deactive" }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $facet: {
                    listings: [
                        { $skip: skip },
                        { $limit: limit },
                        // State
                        {
                            $lookup: {
                                from: "states",
                                let: {
                                    stateId: "$state_id"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$stateId"]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            name: 1
                                        }
                                    }
                                ],
                                as: "state"
                            }
                        },

                        // Location
                        {
                            $lookup: {
                                from: "locations",
                                let: {
                                    locationId: "$location_id"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$locationId"]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            district: 1
                                        }
                                    }
                                ],
                                as: "location"
                            }
                        },

                        // Feature Tags
                        {
                            $lookup: {
                                from: "featuretags",
                                let: {
                                    ids: "$feature_tags_id"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $in: ["$_id", "$$ids"]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            name: 1
                                        }
                                    }
                                ],
                                as: "feature_tags"
                            }
                        },

                        // First Media Only
                        {
                            $lookup: {
                                from: "media",
                                let: {
                                    ids: "$media_id"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $in: ["$_id", "$$ids"]
                                            }
                                        }
                                    },
                                    {
                                        $limit: 1
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            media_url: 1
                                        }
                                    }
                                ],
                                as: "media"
                            }
                        },

                        {
                            $project: {

                                _id: 1,
                                listing_code: 1,
                                category: 1,
                                status: 1,
                                area: 1,
                                unit: 1,
                                price_sqft: 1,
                                createdAt: 1,

                                state: {
                                    $first: "$state.name"
                                },

                                district: {
                                    $first: "$location.district"
                                },

                                feature_tags: "$feature_tags.name",

                                image: {
                                    $first: {
                                        $first: "$media.media_url"
                                    }
                                },

                                total_price: {
                                    $round: [
                                        {
                                            $cond: [
                                                {
                                                    $eq: ["$unit", "acres"]
                                                },
                                                {
                                                    $multiply: [
                                                        "$area",
                                                        43560,
                                                        "$price_sqft"
                                                    ]
                                                },
                                                {
                                                    $multiply: [
                                                        "$area",
                                                        "$price_sqft"
                                                    ]
                                                }
                                            ]
                                        },
                                        2
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

        const listings = result.listings;
        const total = result.totalCount[0]?.count || 0;

        return res.status(200).json({
            success: true,
            data: listings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalListings: total,
                perPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        });

    } catch (err) {
        next(err);
    }
};




// update an listing

export const update_listing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.sub;

        const existing = await listingModel.findOne({ _id: id, user_id });
        if (!existing) throw new NotFoundError("Listing not found or unauthorized");

        const updates        = {};
        const parallelTasks  = {};

        const SCALAR_FIELDS = [
            "public_description", "unit", "category",
            "relation", "utilization",
        ];
        for (const field of SCALAR_FIELDS) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        if (req.body.area       !== undefined) updates.area       = parseFloat(req.body.area);
        if (req.body.price_sqft !== undefined) updates.price_sqft = parseFloat(req.body.price_sqft);

        if (req.body.is_malay_reserve_land !== undefined)
            updates.is_malay_reserve_land =
                req.body.is_malay_reserve_land === "true" ||
                req.body.is_malay_reserve_land === true;

        const { longitude, latitude } = req.body;
        if (longitude !== undefined && latitude !== undefined) {
            parallelTasks.location = locationModel.findByIdAndUpdate(
                existing.location_id,
                {
                    location: {
                        type       : "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                },
                { new: true }
            );
        }

        if (req.body.dealType !== undefined) {
            const deal_types = Array.isArray(req.body.dealType)
                ? req.body.dealType : [req.body.dealType];
            parallelTasks.dealType = dealTypeModel.findByIdAndUpdate(
                existing.deal_type_id?.[0],
                { name: deal_types },
                { new: true }
            );
        }

        if (req.body.feature_tags !== undefined) {
            const tags = Array.isArray(req.body.feature_tags)
                ? req.body.feature_tags : [req.body.feature_tags];
            parallelTasks.featureTags = featureTagModel.findByIdAndUpdate(
                existing.feature_tags_id?.[0],
                { tag: tags },
                { new: true }
            );
        }

        if (req.body.terrain !== undefined) {
            const terrain_list = Array.isArray(req.body.terrain)
                ? req.body.terrain : [req.body.terrain];
            parallelTasks.terrain = terrainTypeModel.findByIdAndUpdate(
                existing.terrain_id?.[0],
                { name: terrain_list },
                { new: true }
            );
        }

        if (req.body.state_name !== undefined) {
            parallelTasks.state = stateModel.findByIdAndUpdate(
                existing.state_id,
                { state: req.body.state_name },
                { new: true }
            );
        }
        if (req.body.district_name !== undefined) {
            parallelTasks.district = districtModel.findOneAndUpdate(
                { state_id: existing.state_id },
                { district: req.body.district_name },
                { new: true }
            );
        }
        if (req.body.sub_district_name !== undefined || req.body.session !== undefined) {
            const subUpdate = {};
            if (req.body.sub_district_name) subUpdate.sub_district = req.body.sub_district_name;
            if (req.body.session)           subUpdate.session       = req.body.session;
            parallelTasks.subDistrict = subDistrictModel.findOneAndUpdate(
                { district_id: existing.district_id },
                subUpdate,
                { new: true }
            );
        }


        if (req.body.tenure_type !== undefined) {
            let leasehold_id = null;
            if (req.body.tenure_type === "leasehold") {
                const leaseholdUpdate = {};
                if (req.body.start_date) leaseholdUpdate.start_date = req.body.start_date;
                if (req.body.end_year)   leaseholdUpdate.end_year   = req.body.end_year;

                const leasehold = await leaseholdDetailModel.findOneAndUpdate(
                    { _id: (await tenureTypeModel.findById(existing.tenure_id))?.leasehold_id },
                    leaseholdUpdate,
                    { upsert: true, new: true }
                );
                leasehold_id = leasehold._id;
            }
            parallelTasks.tenure = tenureTypeModel.findByIdAndUpdate(
                existing.tenure_id,
                { type: req.body.tenure_type, leasehold_id },
                { new: true }
            );
        }


const new_images = req.files?.property_images || [];
const new_docs   = req.files?.geran_doc       || [];

if (new_images.length || new_docs.length) {

    
    const existing_media = await mediaModel.findById(existing.media_id?.[0]);

    const stored = (existing_media?.media_type || []).reduce(
        (acc, type, i) => {
            acc[type].push({
                url       : existing_media.media_url[i],
                public_id : existing_media.public_id[i],
                name      : existing_media.media_name[i],
            });
            return acc;
        },
        { image: [], document: [] }
    );


    const to_delete_pids = [
        ...(new_images.length ? stored.image.map(f => f.public_id)    : []),
        ...(new_docs.length   ? stored.document.map(f => f.public_id) : []),
    ];


    const [image_uploads, doc_uploads] = await Promise.all([
        new_images.length
            ? upload_files_to_cloudinary(new_images, "listings/images")            : [],
        new_docs.length
            ? upload_files_to_cloudinary(new_docs,   "listings/geran/documents")   : [],
        delete_files_from_cloudinary(to_delete_pids),
    ]);

  
    const final = {
        images : new_images.length
            ? image_uploads.map((r, i) => ({
                url  : r.url, public_id: r.public_id,
                type : "image", name: new_images[i].originalname,
              }))
            : stored.image.map(f => ({ ...f, type: "image" })),

        docs : new_docs.length
            ? doc_uploads.map((r, i) => ({
                url  : r.url, public_id: r.public_id,
                type : "document", name: new_docs[i].originalname,
              }))
            : stored.document.map(f => ({ ...f, type: "document" })),
    };

    const merged = [...final.images, ...final.docs];

 
    parallelTasks.media = mediaModel.findByIdAndUpdate(
        existing.media_id?.[0],
        {
            $set: {
                media_url  : merged.map(f => f.url),
                public_id  : merged.map(f => f.public_id),
                media_type : merged.map(f => f.type),
                media_name : merged.map(f => f.name),
            },
        },
        { new: true }
    );
}

        await Promise.all(Object.values(parallelTasks));

        if (!Object.keys(updates).length && !Object.keys(parallelTasks).length)
            throw new BadRequestError("No fields provided to update");

        const updated = await listingModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        const { title , message} =NotificationTemplates.listingUpdated({
            listingCode : updated.listing_code,
            status : "pending"
        })
        const io = req.app.get("io");
        await createAndSendNotification(io,{
    user_id : updated.user_id,
    listing_id: updated._id,
    notifiable_type: "Listing",
    title,
    message
});
        return res.status(200).json({
            data: {
                _id          : updated._id,
                listing_code : updated.listing_code,
                status       : updated.status,
            },
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};



const SQM_TO_SQFT = 10.7639;


const calculate_total_price = (price_sqft, area, unit) => {
    const area_in_sqft = unit === "sqm" ? area * SQM_TO_SQFT : area;
    return parseFloat((price_sqft * area_in_sqft).toFixed(2));
};

const format_listing = (listing) => {
    
    const media       = listing.media_id?.[0];
    const thumb_index = media?.media_type?.findIndex(t => t === "image") ?? -1;
    const thumbnail   = thumb_index !== -1 ? media?.media_url?.[thumb_index] : null;

    return {
        _id                  : listing._id,
        listing_code         : listing.listing_code,
        status               : listing.status,
        public_description   : listing.public_description,
        category             : listing.category,
        relation             : listing.relation,
        utilization          : listing.utilization,
        is_malay_reserve_land: listing.is_malay_reserve_land,
        unit                 : listing.unit,
        area                 : listing.area,
        price_sqft           : listing.price_sqft,
        total_price_myr      : calculate_total_price(
                                listing.price_sqft,
                                listing.area,
                                listing.unit
                            ),
        thumbnail,
        deal_types           : listing.deal_type_id?.[0]?.name   ?? [],
        feature_tags         : listing.feature_tags_id?.[0]?.tag  ?? [],
    };
};


const get_listings_by_status = async (user_id, status, page, limit) => {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
        listingModel
            .find({ user_id, status })
            .populate("deal_type_id",    "name")
            .populate("feature_tags_id", "tag")
            .populate({
                path  : "media_id",
                select: "media_url media_type",
            })
            .skip(skip)
            .limit(limit)
            .lean(),
        listingModel.countDocuments({ user_id, status }),
    ]);

    return {
        listings: listings.map(format_listing),
        pagination: {
            total,
            page,
            limit      : limit,
            total_pages: Math.ceil(total / limit),
        },
    };
};

// ── 1. Drafts
export const get_draft_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = Math.max(Number(req.query.page) || 1, 1);
        const limit   = Math.max(Number(req.query.limit) || 10, 1);
        const data    = await get_listings_by_status(user_id, "draft", page, limit);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

export const get_under_review_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = Math.max(Number(req.query.page) || 1, 1);
        const limit   = Math.max(Number(req.query.limit) || 10, 1);
        const data    = await get_listings_by_status(user_id, "under_review", page, limit);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

// ── 3. Pending
export const get_pending_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = Math.max(Number(req.query.page) || 1, 1);
        const limit   = Math.max(Number(req.query.limit) || 10, 1);
        const data    = await get_listings_by_status(user_id, "pending", page, limit);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

export const get_inactive_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = Math.max(Number(req.query.page) || 1, 1);
        const limit   = Math.max(Number(req.query.limit) || 10, 1);
        const data    = await get_listings_by_status(user_id, "inactive", page, limit);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};


export const get_active_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = Math.max(Number(req.query.page) || 1, 1);
        const limit   = Math.max(Number(req.query.limit) || 10, 1);
        const data    = await get_listings_by_status(user_id, "active", page, limit);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};


export const search_listings = async (req, res, next) => {
    try {
        const page  = Math.max(Number(req.query.page)  || 1,  1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip  = (page - 1) * limit;

        const {
            state, district, category, utilization, relation,
            terrain, deal_type, feature_tag, is_malay_reserve_land,
            unit, min_area, max_area,price_sqft
        } = req.query;
        const hasSearchFilter = [
            state,
            district,
            category,
            utilization,
            relation,
            terrain,
            deal_type,
            feature_tag,
            is_malay_reserve_land,
            unit,
            min_area,
            max_area,
            price_sqft
        ].some(value =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );


        // No search parameter
        if (!hasSearchFilter) {

            return res.status(200).json({
                success: true,
                message: "Please provide a search parameter.",
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalListings: 0,
                    perPage: limit,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            });
        }
        const filter = { status: "active" };
        let state_ids = null;
        if (state) {
            const states = await stateModel.find({ state: state.trim() }, "_id").lean();
            state_ids = states.map(s => String(s._id));
        }
if (district) {
    const districts = await districtModel
        .find({ district: district.trim() }, "state_id")
        .lean();
    const districtStateIds = districts.map(d => String(d.state_id));
    state_ids = state_ids.filter(id => districtStateIds.includes(id));
}
if (state_ids?.length) {
    filter.state_id = { $in: state_ids };
}
        if (deal_type) {
            const docs = await dealTypeModel.find({ name: deal_type.trim() }, "_id").lean();
            filter.deal_type_id = { $in: docs.map(d => d._id) };
        }

        if (terrain) {
            const docs = await terrainTypeModel.find({ name: terrain.trim() }, "_id").lean();
            filter.terrain_id = { $in: docs.map(d => d._id) };
        }

        if (feature_tag) {
            const docs = await featureTagModel.find({ tag: feature_tag.trim() }, "_id").lean();
            filter.feature_tags_id = { $in: docs.map(d => d._id) };
        }

        if (category)    filter.category    = category.trim();
        if (utilization) filter.utilization = utilization.trim();
        if (relation)    filter.relation    = relation.trim();
        if (unit)        filter.unit        = unit.trim();

        if (is_malay_reserve_land === "true" || is_malay_reserve_land === "false") {
            filter.is_malay_reserve_land = is_malay_reserve_land === "true";
        }

        if (min_area || max_area) {
            filter.area = {};
            if (min_area) filter.area.$gte = Number(min_area);
            if (max_area) filter.area.$lte = Number(max_area);
        }
if (price_sqft) {
    filter.price_sqft = {
        $lte: Number(price_sqft)
    };
} 

      
        const [listings, total] = await Promise.all([
            listingModel
                .find(filter)
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .populate("state_id",        "state")
                .populate("deal_type_id",    "name")
                .populate("terrain_id",      "name")
                .populate("feature_tags_id", "tag")
                .populate("media_id",        "media_url")
                .populate("location_id",     "location")
                .lean(),
            listingModel.countDocuments(filter),
        ]);
        const districts = await districtModel
            .find({ state_id: { $in: listings.map(l => l.state_id?._id) } }, "state_id district")
            .lean();
        const district_by_state = {};
        for (const d of districts) {
            district_by_state[String(d.state_id)] = d.district;
        }
        const data = listings.map(listing => {
            const coordinates = listing.location_id?.location?.coordinates || [];
            return {
                listing_id           : listing._id,
                listing_code         : listing.listing_code,
                status               : listing.status,
                category             : listing.category,
                utilization          : listing.utilization,
                relation             : listing.relation,
                is_malay_reserve_land: listing.is_malay_reserve_land,
                public_description   : listing.public_description,
                unit                 : listing.unit,
                area                 : listing.area,
                price_sqft           : listing.price_sqft,
                total_price          : calculate_total_price(
                                        listing.price_sqft,
                                        listing.area,
                                        listing.unit
                                    ),
                createdAt            : listing.createdAt,
                state                : listing.state_id?.state ?? null,
                district             : district_by_state[String(listing.state_id?._id)] ?? null,
                deal_types           : listing.deal_type_id?.flatMap(d => d.name) ?? [],
                terrain              : listing.terrain_id?.flatMap(t => t.name)   ?? [],
                feature_tags         : listing.feature_tags_id?.flatMap(f => f.tag) ?? [],
                image                : listing.media_id?.[0]?.media_url?.[0] ?? null,
                location             : {
                    longitude: coordinates[0] ?? null,
                    latitude : coordinates[1] ?? null,
                },
            };
        });

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            message: "Listings fetched successfully.",
            data,
            pagination: {
                currentPage:     page,
                totalPages,
                totalListings:   total,
                perPage:         limit,
                hasNextPage:     page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (err) {
        next(err);
    }
};


export const get_all_listings_by_admin = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const result = await listingModel.aggregate([
            {
                $facet: {
                    listings: [
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        },
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
                        {
                            $lookup: {
                                from: "states",
                                localField: "state_id",
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
                        {
                            $lookup: {
                                from: "dealtypes",
                                localField: "deal_type_id",
                                foreignField: "_id",
                                as: "deal_type"
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                listing_id: "$_id",
                                listing_code: 1,
                                status: 1,
                                fullname: "$user.fullname",
                                state: "$state.state",
                                district: "$district.district",
                                deal_type: {
                                    $ifNull: [
                                        { $arrayElemAt: ["$deal_type.name", 0] },
                                        []
                                    ]
                                },
                                createdAt: 1
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
            message: "Listings fetched successfully.",
            page,
            totalPages,
            totalListings,
            listings
        });

    } catch (err) {
        next(err);
    }
};

// change listing status by admin

export const change_listing_status = async (req, res, next) => {
    try {
        const { status , description} = req.body;
        const { listing_id } = req.params;
        const oldStatuss = await listingModel.findById(listing_id, "status").lean();
        const oldStatus = oldStatuss.status;
        const listing = await listingModel.findByIdAndUpdate(
            listing_id,
            {
                $set: {
                    status
                }
            },
            {
                returnDocument : "after"
            }
        );

        const notes = await notesModel.create({
            description ,
            listing_id
        })
        const [state, district] = await Promise.all([
            stateModel.findById(listing.state_id, "state").lean(),
            districtModel.findOne({ state_id: listing.state_id }, "district").lean()
        ]);
        const stateName= state.state;
        const districtName= district.district;
        const { title , message} =NotificationTemplates.listingStatusChanged({
            listingCode : listing.listing_code,
            state : stateName,
            district : districtName,
            oldStatus : oldStatus,
            newStatus : status
        });
        const io = req.app.get("io");
        await createAndSendNotification(io,{
    user_id: listing.user_id,
    listing_id: listing._id,
    notifiable_type: "Listing",
    title,
    message
});
        return res.status(200).json({
            message: "Listing status updated successfully.",
            listing: {
                listing_id: listing._id,
                listing_code: listing.listing_code,
                status: listing.status,
                notes
            }
        });
    } catch (err) {
        next(err);
    }
};


export const get_single_listing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await listingModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
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
            {
                $lookup: {
                    from: "media",
                    localField: "media_id",
                    foreignField: "_id",
                    as: "media"
                }
            },
            {
                $lookup: {
                    from: "dealtypes",
                    localField: "deal_type_id",
                    foreignField: "_id",
                    as: "deal_types"
                }
            },
            {
                $lookup: {
                    from: "featuretags",
                    localField: "feature_tags_id",
                    foreignField: "_id",
                    as: "feature_tags"
                }
            },
            {
                $lookup: {
                    from: "terraintypes",
                    localField: "terrain_id",
                    foreignField: "_id",
                    as: "terrain"
                }
            },
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
            {
                $addFields: {
                    total_price: {
                        $multiply: ["$area", "$price_sqft"]
                    }
                }
            },
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
            {
                $project: {
                    _id: 0,
                    total_views: 1,
                    total_clicks: 1,
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
                        public_id : "$media.public_id"
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
        if (!listing.length) {
            throw new NotFoundError("Listing not found.");
        }
        return res.status(200).json({
            message: "Listing fetched successfully.",
            listing: listing[0]
        });
    } catch (err) {
        next(err);
    }
};

// get all listing after zoom out map
export const get_listing_by_radius = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 100 } = req.query;
        const centerLat = Number(latitude);
        const centerLon = Number(longitude);
        const maxRadius = Number(radius);
        const latDelta = maxRadius / 111;
        const lonDelta = maxRadius / (111 * Math.cos(centerLat * Math.PI / 180));
        const minLat = centerLat - latDelta;
        const maxLat = centerLat + latDelta;
        const minLon = centerLon - lonDelta;
        const maxLon = centerLon + lonDelta;
        const listings = await listingModel.aggregate([
            { $match: { status: "active" } },
            {
                $lookup: {
                    from: "locations",
                    localField: "location_id",
                    foreignField: "_id",
                    as: "location"
                }
            },
            { $unwind: "$location" },
            {
                $lookup: {
                    from: "media",
                    localField: "media_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { media_url: 1 } }],
                    as: "media"
                }
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { state: 1 } }],
                    as: "state"
                }
            },
            { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "districts",
                    localField: "district_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { district: 1 } }],
                    as: "district"
                }
            },
            { $unwind: { path: "$district", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "dealtypes",
                    localField: "deal_type_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1 } }],
                    as: "deal_types"
                }
            },

            {
                $lookup: {
                    from: "featuretags",
                    localField: "feature_tags_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { tag: 1 } }],
                    as: "feature_tags"
                }
            },

            {
                $project: {
                    listing_code: 1,
                    status: 1,
                    category: 1,
                    area: 1,
                    price_sqft: 1,
                    total_price: { $multiply: ["$area", "$price_sqft"] },
                    lat: { $arrayElemAt: ["$location.location.coordinates", 1] },
                    lon: { $arrayElemAt: ["$location.location.coordinates", 0] },
                    first_image: { $arrayElemAt: [{ $arrayElemAt: ["$media.media_url", 0] }, 0] },
                    state: "$state.state",
                    district: "$district.district",
                    deal_type: "$deal_types.name",
                    feature_tags: "$feature_tags.tag",
                }
            }
        ]);
        const filtered = listings
            .filter((listing) => {
                const lat = Number(listing.lat);
                const lon = Number(listing.lon);
                return (
                    lat >= minLat &&
                    lat <= maxLat &&
                    lon >= minLon &&
                    lon <= maxLon
                );
            })
            .map((listing) => ({
                listing_code: listing.listing_code,
                status: listing.status,
                category: listing.category,
                area: listing.area,
                price_sqft: listing.price_sqft,
                total_price: listing.total_price,
                location: {
                    latitude: listing.lat,
                    longitude: listing.lon,
                },
                first_image: listing.first_image,
                state: listing.state,
                district: listing.district,
                deal_type: listing.deal_type,
                feature_tags: listing.feature_tags,
            }));
        return res.status(200).json({
            center: { latitude: centerLat, longitude: centerLon },
            radius: `${maxRadius} KM`,
            total: filtered.length,
            listings: filtered,
        });
    } catch (err) {
        next(err);
    }
};

export const deactivate_listing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.sub;
        const deleted_listing = await listingModel.findByIdAndUpdate( id , { $set : { status : "deactive"} },  { returnDocument : "after"} )
        if ( !deleted_listing) throw new NotFoundError(" Listing is not found ")
        const { title, message } = NotificationTemplates.listingDelete({
            listingCode: deleted_listing.listing_code,
            status: "deactive"
        });
        const io = req.app.get("io");
        await createAndSendNotification(io, {
            user_id: deleted_listing.user_id,
            listing_id: deleted_listing._id,
            notifiable_type: "Listing",
            title,
            message
        });
        return res.status(200).json({
            message: "Listing deactivated successfully."
        });
    } catch (err) {
        next(err);
    }
};

// get all views and counts
export const get_all_views_count = async (req, res, next) => {
    try {
        const user_id = new mongoose.Types.ObjectId(req.user.sub);
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const result = await listingModel.aggregate([
            {
                $match: {
                    user_id,
                    status: "active"
                }
            },
            {
                $lookup: {
                    from: "listingactivities",
                    localField: "_id",
                    foreignField: "listing_id",
                    as: "activities"
                }
            },
            {
                $project: {
                    total_views: {
                        $sum: "$activities.view_count"
                    },
                    total_clicks: {
                        $sum: "$activities.click_count"
                    },
                    current_views: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$activities",
                                        as: "a",
                                        cond: { $gte: ["$$a.createdAt", startOfCurrentMonth] }
                                    }
                                },
                                as: "a",
                                in: "$$a.view_count"
                            }
                        }
                    },
                    current_clicks: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$activities",
                                        as: "a",
                                        cond: { $gte: ["$$a.createdAt", startOfCurrentMonth] }
                                    }
                                },
                                as: "a",
                                in: "$$a.click_count"
                            }
                        }
                    },
                    prev_views: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$activities",
                                        as: "a",
                                        cond: {
                                            $and: [
                                                { $gte: ["$$a.createdAt", startOfPreviousMonth] },
                                                { $lt: ["$$a.createdAt", startOfCurrentMonth] }
                                            ]
                                        }
                                    }
                                },
                                as: "a",
                                in: "$$a.view_count"
                            }
                        }
                    },
                    prev_clicks: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$activities",
                                        as: "a",
                                        cond: {
                                            $and: [
                                                { $gte: ["$$a.createdAt", startOfPreviousMonth] },
                                                { $lt: ["$$a.createdAt", startOfCurrentMonth] }
                                            ]
                                        }
                                    }
                                },
                                as: "a",
                                in: "$$a.click_count"
                            }
                        }
                    }
                }
            },

            {
                $group: {
                    _id: null,
                    total_views: {
                        $sum: "$total_views"
                    },
                    total_clicks: {
                        $sum: "$total_clicks"
                    },
                    current_views: { $sum: "$current_views" },
                    current_clicks: { $sum: "$current_clicks" },
                    prev_views: { $sum: "$prev_views" },
                    prev_clicks: { $sum: "$prev_clicks" }
                }
            },

            {
                $project: {
                    _id: 0,
                    total_views: 1,
                    total_clicks: 1,
                    views_growth: {
                        $cond: {
                            if: { $eq: ["$prev_views", 0] },
                            then: null,
                            else: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    { $subtract: ["$current_views", "$prev_views"] },
                                                    "$prev_views"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    1
                                ]
                            }
                        }
                    },
                    clicks_growth: {
                        $cond: {
                            if: { $eq: ["$prev_clicks", 0] },
                            then: null,
                            else: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    { $subtract: ["$current_clicks", "$prev_clicks"] },
                                                    "$prev_clicks"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    1
                                ]
                            }
                        }
                    }
                }
            }
        ]);
        return res.status(200).json(
            result[0] || {
                total_views: 0,
                total_clicks: 0,
                views_growth: null,
                clicks_growth: null
            }
        );
    } catch (err) {
        next(err);
    }
};

// make draft published 

export const publish_listing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await listingModel.findById(id);
        if (!listing)
            throw new NotFoundError("Listing not found.");
        if (listing.status !== "draft")
            throw new BadRequestError("Only draft listings can be pending.");
        listing.status = "pending";
        listing.published_at = new Date();
        await listing.save();
        // Send notification
        const { title , message} =NotificationTemplates.listingStatusChanged({
            listingCode : listing.listing_code,
            status : "pending"
        })
        await createAndSendNotification({
    user_id: listing.user_id,
    listing_id: listing._id,
    notifiable_type: "Listing",
    title,
    message
});
        return res.status(200).json({
            message: "Listing pending successfully."
        });
    } catch (err) {
        next(err);
    }
};


// admin get top listings 

export const get_all_Top_listing = async ( req , res , next  )=>{
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const result = await listingModel.aggregate([
            {
                $match: {
                    status: "active"
                }
            },
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
                    total_views: { $sum: "$activity.view_count" }
                }
            },
            {
                $match : { 
                    total_views : { $gt : 0}
                }
            },
            {
                $sort: { total_views: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 0,
                    listing_id: "$_id",
                    listing_code: 1,
                    total_views: 1
                }
            }
        ]);
        const totalListings = await listingModel.countDocuments({ status: "active" });
        const totalPages = Math.ceil(totalListings / limit);
        return res.status(200).json({
            message: "Top listings fetched successfully.",
            page,
            totalPages,
            totalListings,
            listings: result
        });
    }catch ( err ){
        next ( err );
    }
}


export const get_recently_improved_listings = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        const listings = await listingModel.aggregate([
            {
                $match: {
                    status: "active",
                    updatedAt: {
                        $gte: sevenDaysAgo
                    }
                }
            },
            {
                $set: {
                    thumbnail_media_id: {
                        $arrayElemAt: ["$media_id", 0]
                    }
                }
            },
            {
                $lookup: {
                    from: "media",
                    localField: "thumbnail_media_id",
                    foreignField: "_id",
                    as: "thumbnail"
                }
            },
            {
                $unwind: {
                    path: "$thumbnail",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    listing_code: 1,
                    status: 1,
                    area: 1,
                    unit: 1,
                    updatedAt: 1,
                    thumbnail: {
                        $arrayElemAt: [
                            "$thumbnail.media_url",
                            0
                        ]
                    },
                    state_id: 1,
                    feature_tags_id: 1,
                    terrain_id: 1,
                    deal_type_id: 1
                }
            },
            {
                $sort: {
                    updatedAt: -1
                }
            }
        ]);
        return res.status(200).json({
            status: "success",
            data: {
                total: listings.length,
                listings
            }
        });
    } catch (err) {
        next(err);
    }
};


export const get_listing_enquiry_statistics = async (req, res, next) => {
    try {
        const [
            total_listings,
            under_review_listings,
            pending_listings,
            pending_enquiries,
            need_more_info_enquiries
        ] = await Promise.all([
            listingModel.countDocuments(),
            listingModel.countDocuments({
                status: "under_review"
            }),
            listingModel.countDocuments({
                status: "pending"
            }),
            enquiryModel.countDocuments({
                status: "pending"
            }),
            enquiryModel.countDocuments({
                status: "need_more_info"
            })
        ]);
        return res.status(200).json({
            status: "success",
            data: {
                total_listings,
                under_review_listings,
                pending_listings,
                pending_enquiries,
                need_more_info_enquiries
            }
        });
    } catch (err) {
        next(err);
    }
};

export const get_listing_notes = async (req, res, next) => {
    try {
        const { listing_id } = req.params;
        if (!listing_id) {
            throw new BadRequestError("Listing ID is required");
        }
        if (!mongoose.Types.ObjectId.isValid(listing_id)) {
            throw new BadRequestError("Invalid listing ID");
        }
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const filter = {
            listing_id: new mongoose.Types.ObjectId(listing_id)
        };
        const [notes, total] = await Promise.all([
            
                notesModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            notesModel.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            status: "success",
            data: {
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages,
                notes
            }
        });
    } catch (err) {
        next(err);
    }
};

export const get_listing_dashboard = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const allowedStatuses = [
            "active",
            "pending",
            "under_review",
            "need_more_info"
        ];
        const result = await listingModel.aggregate([
            {
                $match: {
                    status: {
                        $in: allowedStatuses
                    }
                }
            },
            {
                $facet: {
                    totalListings: [
                        {
                            $count: "count"
                        }
                    ],
                    activeListings: [
                        {
                            $match: {
                                status: "active"
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    pendingListings: [
                        {
                            $match: {
                                status: "pending"
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    underReviewListings: [
                        {
                            $match: {
                                status: "under_review"
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    needMoreInfoListings: [
                        {
                            $match: {
                                status: "need_more_info"
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],

                    listings: [
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
                        {
                            $lookup: {
                                from: "media",
                                let: {
                                    mediaIds: "$media_id"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $in: [
                                                    "$_id",
                                                    "$$mediaIds"
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            thumbnail: {
                                                $arrayElemAt: [
                                                    "$media_url",
                                                    0
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $limit: 1
                                    }
                                ],
                                as: "media"
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
                            $project: {
                                _id: 1,
                                listing_code: 1,
                                status: 1,
                                thumbnail: {
                                    $arrayElemAt: [
                                        "$media.thumbnail",
                                        0
                                    ]
                                },
                                calculated_price: {
                                    $multiply: [
                                        "$area",
                                        "$price_sqft"
                                    ]
                                },
                                unit: 1,
                                area: 1,
                                updatedAt: 1,
                                location: {
                                    $arrayElemAt: [
                                        "$location",
                                        0
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const data = result[0];

        const total =
            data.totalListings[0]?.count || 0;

        const active =
            data.activeListings[0]?.count || 0;

        const pending =
            data.pendingListings[0]?.count || 0;

        const under_review =
            data.underReviewListings[0]?.count || 0;

        const need_more_info =
            data.needMoreInfoListings[0]?.count || 0;

        return res.status(200).json({
            status: "success",
            data: {
                counts: {
                    total,
                    active,
                    pending,
                    under_review,
                    need_more_info
                },

                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page < Math.ceil(total / limit)
                },

                listings: data.listings
            }
        });

    } catch (err) {
        next(err);
    }
};


// dashboard listing search option
export const search_dashboard_listings = async (req, res, next) => {
    try {

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.max(
            Number(req.query.limit) || 10,
            1
        );

        const skip = (page - 1) * limit;

        const {
            state,
            district,
            category,
            utilization,
            relation,
            terrain,
            deal_type,
            feature_tag,
            is_malay_reserve_land,
            unit,
            min_area,
            max_area,
            price_sqft
        } = req.query;
        const hasSearchFilter = [
            state,
            district,
            category,
            utilization,
            relation,
            terrain,
            deal_type,
            feature_tag,
            is_malay_reserve_land,
            unit,
            min_area,
            max_area,
            price_sqft
        ].some(value =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );


        if (!hasSearchFilter) {

            return res.status(200).json({
                success: true,
                message: "Please provide a search parameter.",
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalListings: 0,
                    perPage: limit,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            });
        }
        const filter = {
            status: {
                $in: [
                    "active",
                    "pending",
                    "under_review",
                    "need_more_info"
                ]
            }
        };
        let state_ids = null;

        if (state) {

            const states = await stateModel
                .find(
                    {
                        state: state.trim()
                    },
                    "_id"
                )
                .lean();


            // State doesn't exist
            if (!states.length) {

                return res.status(200).json({
                    success: true,
                    message: "No listings found.",
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalListings: 0,
                        perPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                });
            }


            state_ids = states.map(
                state => state._id
            );
        }
        if (district) {

            const districts = await districtModel
                .find(
                    {
                        district: district.trim()
                    },
                    "state_id"
                )
                .lean();


            // District doesn't exist
            if (!districts.length) {

                return res.status(200).json({
                    success: true,
                    message: "No listings found.",
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalListings: 0,
                        perPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                });
            }
            const districtStateIds =
                districts.map(
                    district => String(district.state_id)
                );
            if (state_ids) {
                state_ids = state_ids.filter(
                    id =>
                        districtStateIds.includes(
                            String(id)
                        )
                );
            } else {
                state_ids =
                    districts.map(
                        district => district.state_id
                    );
            }
        }
        if (state_ids) {
            if (!state_ids.length) {
                return res.status(200).json({
                    success: true,
                    message: "No listings found.",
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalListings: 0,
                        perPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                });
            }
            filter.state_id = {
                $in: state_ids
            };
        }
        if (deal_type) {
            const dealTypes = await dealTypeModel
                .find(
                    {
                        name: deal_type.trim()
                    },
                    "_id"
                )
                .lean();
            // Deal type name doesn't exist
            if (!dealTypes.length) {

                return res.status(200).json({
                    success: true,
                    message: "No listings found.",
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalListings: 0,
                        perPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                });
            }


            filter.deal_type_id = {
                $in: dealTypes.map(
                    deal => deal._id
                )
            };
        }
        if (terrain) {

            const terrains = await terrainTypeModel
                .find(
                    {
                        name: terrain.trim()
                    },
                    "_id"
                )
                .lean();


            if (!terrains.length) {

                return res.status(200).json({
                    success: true,
                    message: "No listings found.",
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalListings: 0,
                        perPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                });
            }


            filter.terrain_id = {
                $in: terrains.map(
                    terrain => terrain._id
                )
            };
        }
        if (feature_tag) {

            const featureTags = await featureTagModel
                .find(
                    {
                        tag: feature_tag.trim()
                    },
                    "_id"
                )
                .lean();


            if (!featureTags.length) {

                return res.status(200).json({
                    success: true,
                    message: "No listings found.",
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalListings: 0,
                        perPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                });
            }


            filter.feature_tags_id = {
                $in: featureTags.map(
                    tag => tag._id
                )
            };
        }
        if (category) {
            filter.category = category.trim();
        }


        if (utilization) {
            filter.utilization =
                utilization.trim();
        }


        if (relation) {
            filter.relation =
                relation.trim();
        }


        if (unit) {
            filter.unit =
                unit.trim();
        }

        if (
            is_malay_reserve_land === "true" ||
            is_malay_reserve_land === "false"
        ) {

            filter.is_malay_reserve_land =
                is_malay_reserve_land === "true";
        }
        if (min_area || max_area) {

            filter.area = {};

            if (min_area) {

                filter.area.$gte =
                    Number(min_area);
            }

            if (max_area) {

                filter.area.$lte =
                    Number(max_area);
            }
        }
        if (price_sqft) {

            filter.price_sqft = {
                $lte: Number(price_sqft)
            };
        }


        console.log("FINAL FILTER:", filter);
        const [
            listings,
            total
        ] = await Promise.all([

            listingModel
                .find(filter)
                .sort({
                    createdAt: -1,
                    _id: -1
                })
                .skip(skip)
                .limit(limit)

                .populate(
                    "state_id",
                    "state"
                )

                .populate(
                    "deal_type_id",
                    "name"
                )

                .populate(
                    "terrain_id",
                    "name"
                )

                .populate(
                    "feature_tags_id",
                    "tag"
                )

                .populate(
                    "media_id",
                    "media_url"
                )

                .populate(
                    "location_id",
                    "location"
                )

                .lean(),

            listingModel.countDocuments(filter)
        ]);
        const stateIds = listings
            .map(
                listing =>
                    listing.state_id?._id
            )
            .filter(Boolean);


        const districts = stateIds.length
            ? await districtModel
                .find(
                    {
                        state_id: {
                            $in: stateIds
                        }
                    },
                    "state_id district"
                )
                .lean()
            : [];


        const district_by_state = {};


        for (const district of districts) {

            district_by_state[
                String(district.state_id)
            ] = district.district;
        }
        const data = listings.map(
            listing => {

                const coordinates =
                    listing.location_id
                        ?.location
                        ?.coordinates || [];


                return {

                    listing_id:
                        listing._id,

                    listing_code:
                        listing.listing_code,

                    status:
                        listing.status,

                    category:
                        listing.category,

                    utilization:
                        listing.utilization,

                    relation:
                        listing.relation,

                    is_malay_reserve_land:
                        listing.is_malay_reserve_land,

                    public_description:
                        listing.public_description,

                    unit:
                        listing.unit,

                    area:
                        listing.area,

                    price_sqft:
                        listing.price_sqft,

                    total_price:
                        calculate_total_price(
                            listing.price_sqft,
                            listing.area,
                            listing.unit
                        ),

                    createdAt:
                        listing.createdAt,

                    state:
                        listing.state_id?.state
                        ?? null,

                    district:
                        district_by_state[
                            String(
                                listing.state_id?._id
                            )
                        ] ?? null,

                    deal_types:
                        listing.deal_type_id
                            ?.flatMap(
                                deal => deal.name
                            ) ?? [],

                    terrain:
                        listing.terrain_id
                            ?.flatMap(
                                terrain => terrain.name
                            ) ?? [],

                    feature_tags:
                        listing.feature_tags_id
                            ?.flatMap(
                                tag => tag.tag
                            ) ?? [],

                    // First image only
                    image:
                        listing.media_id?.[0]
                            ?.media_url?.[0]
                            ?? null,

                    location: {

                        longitude:
                            coordinates[0]
                            ?? null,

                        latitude:
                            coordinates[1]
                            ?? null
                    }
                };
            }
        );

        const totalPages =
            Math.ceil(total / limit);


        return res.status(200).json({

            success: true,

            message:
                "Listings fetched successfully.",

            data,

            pagination: {

                currentPage:
                    page,

                totalPages,

                totalListings:
                    total,

                perPage:
                    limit,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1
            }
        });


    } catch (err) {

        next(err);
    }
};