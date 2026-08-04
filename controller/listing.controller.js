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
import { createNotification } from "../services/notification.service.js";


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
        await createNotification({

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
        // ── Transaction closed ─────────────────────────────────────────────

        // Notification after commit — failure here won't roll back the listing
        const { title, message } = NotificationTemplates.listingDraftSaved({
            listingCode: listing[0].listing_code,
            state: state_doc[0].state,
            district: district_doc[0].district,
            status: "pending",
        });

        await createNotification({
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
        const page = Math.max(1, Number(req.body.page) || 1);
        const limit = 10;
        const skip = (page - 1) * limit;

        const userId = new mongoose.Types.ObjectId(req.user.sub);

        const [result] = await listingModel.aggregate([
            {
                $match: {
                    user_id: userId
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

        // ── Scalar fields (update only if provided) ───────────────────────
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

        // ── Location (independent — only runs if coordinates sent) ────────
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

        // ── Deal types ────────────────────────────────────────────────────
        if (req.body.dealType !== undefined) {
            const deal_types = Array.isArray(req.body.dealType)
                ? req.body.dealType : [req.body.dealType];
            parallelTasks.dealType = dealTypeModel.findByIdAndUpdate(
                existing.deal_type_id?.[0],
                { name: deal_types },
                { new: true }
            );
        }

        // ── Feature tags ──────────────────────────────────────────────────
        if (req.body.feature_tags !== undefined) {
            const tags = Array.isArray(req.body.feature_tags)
                ? req.body.feature_tags : [req.body.feature_tags];
            parallelTasks.featureTags = featureTagModel.findByIdAndUpdate(
                existing.feature_tags_id?.[0],
                { tag: tags },
                { new: true }
            );
        }

        // ── Terrain ───────────────────────────────────────────────────────
        if (req.body.terrain !== undefined) {
            const terrain_list = Array.isArray(req.body.terrain)
                ? req.body.terrain : [req.body.terrain];
            parallelTasks.terrain = terrainTypeModel.findByIdAndUpdate(
                existing.terrain_id?.[0],
                { name: terrain_list },
                { new: true }
            );
        }

        // ── State / District / Sub-district ───────────────────────────────
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

        // ── Tenure ────────────────────────────────────────────────────────
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

        // ── Media (images / geran docs) ───────────────────────────────────
       // ── Media (replace old → upload new, scoped per type) ────────────────────────
const new_images = req.files?.property_images || [];
const new_docs   = req.files?.geran_doc       || [];

if (new_images.length || new_docs.length) {

    // 1. Fetch the existing media doc to know which public_ids to delete
    const existing_media = await mediaModel.findById(existing.media_id?.[0]);

    // Separate stored entries by type so we only touch what's being replaced
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

    // 2. Delete old Cloudinary files for the types being replaced
    const to_delete_pids = [
        ...(new_images.length ? stored.image.map(f => f.public_id)    : []),
        ...(new_docs.length   ? stored.document.map(f => f.public_id) : []),
    ];

    // 3. Upload new files + delete old ones in parallel
    const [image_uploads, doc_uploads] = await Promise.all([
        new_images.length
            ? upload_files_to_cloudinary(new_images, "listings/images")            : [],
        new_docs.length
            ? upload_files_to_cloudinary(new_docs,   "listings/geran/documents")   : [],
        delete_files_from_cloudinary(to_delete_pids),   // fire & don't wait separately
    ]);

    // 4. Merge: keep untouched type, replace the updated type
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

    // 5. Overwrite media document with merged result
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

        // ── Run all parallel updates + listing scalar update ───────────────
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
        await createNotification({

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


// ── constants ─────────────────────────────────────────────────────────────────
const LIMIT       = 10;
const SQM_TO_SQFT = 10.7639; // Malaysian property standard (sq ft primary)

// ── price calculator ──────────────────────────────────────────────────────────
const calculate_total_price = (price_sqft, area, unit) => {
    const area_in_sqft = unit === "sqm" ? area * SQM_TO_SQFT : area;
    return parseFloat((price_sqft * area_in_sqft).toFixed(2));
};

// ── listing formatter (shapes each doc before sending) ────────────────────────
const format_listing = (listing) => {
    // Thumbnail → first image entry in media doc
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

// ── shared DB helper ──────────────────────────────────────────────────────────
const get_listings_by_status = async (user_id, status, page) => {
    const skip = (page - 1) * LIMIT;

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
            .limit(LIMIT)
            .lean(),
        listingModel.countDocuments({ user_id, status }),
    ]);

    return {
        listings: listings.map(format_listing),
        pagination: {
            total,
            page,
            limit      : LIMIT,
            total_pages: Math.ceil(total / LIMIT),
        },
    };
};

// ── 1. Drafts ─────────────────────────────────────────────────────────────────
export const get_draft_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = parseInt(req.query.page) || 1;
        const data    = await get_listings_by_status(user_id, "draft", page);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

// ── 2. Under Review ───────────────────────────────────────────────────────────
export const get_under_review_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = parseInt(req.query.page) || 1;
        const data    = await get_listings_by_status(user_id, "under_review", page);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

// ── 3. Pending ────────────────────────────────────────────────────────────────
export const get_pending_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = parseInt(req.query.page) || 1;
        const data    = await get_listings_by_status(user_id, "pending", page);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

// ── 4. Inactive ───────────────────────────────────────────────────────────────
export const get_inactive_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = parseInt(req.query.page) || 1;
        const data    = await get_listings_by_status(user_id, "inactive", page);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};

// ── 5. Active ─────────────────────────────────────────────────────────────────
export const get_active_listings = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const page    = parseInt(req.query.page) || 1;
        const data    = await get_listings_by_status(user_id, "active", page);
        return res.status(200).json({ data });
    } catch (err) { console.error(err); next(err); }
};


// apply regex search


// ── search listings ───────────────────────────────────────────────────────────
export const search_listings = async (req, res, next) => {
    try {
        const {
            search,          
            deal_type,       
            category,        
            terrain,         // Flat | Hilly | Mixed
            utilization,     // Agricultural use | Commercial use | etc.
            tanah_rizab,     // yes | no | both
            area_min,
            area_max,
            price_sqft_min,
            price_sqft_max,
            title_type,      // leasehold | freehold  (regex → matches either)
        } = req.query;

        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * LIMIT;

        // ── 1. Base match — always active only ────────────────────────────
        const base_match = { status: "active" };

        if (category)    base_match.category    = { $regex: category,    $options: "i" };
        if (utilization) base_match.utilization = { $regex: utilization, $options: "i" };

        if (tanah_rizab === "yes") base_match.is_malay_reserve_land = true;
        if (tanah_rizab === "no")  base_match.is_malay_reserve_land = false;
        // "both" → no filter added

        if (area_min || area_max) {
            base_match.area = {};
            if (area_min) base_match.area.$gte = parseFloat(area_min);
            if (area_max) base_match.area.$lte = parseFloat(area_max);
        }

        if (price_sqft_min || price_sqft_max) {
            base_match.price_sqft = {};
            if (price_sqft_min) base_match.price_sqft.$gte = parseFloat(price_sqft_min);
            if (price_sqft_max) base_match.price_sqft.$lte = parseFloat(price_sqft_max);
        }

        // ── 2. Aggregation pipeline ────────────────────────────────────────
        const pipeline = [
            { $match: base_match },

            // State
            {
                $lookup: {
                    from        : "states",
                    localField  : "state_id",
                    foreignField: "_id",
                    as          : "state",
                },
            },
            { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },

            // District (matched by state_id since listing has no district_id)
            {
                $lookup: {
                    from        : "districts",
                    localField  : "state_id",
                    foreignField: "state_id",
                    as          : "districts",
                },
            },

            // Deal types
            {
                $lookup: {
                    from        : "dealtypes",
                    localField  : "deal_type_id",
                    foreignField: "_id",
                    as          : "deal_type_docs",
                },
            },

            // Feature tags
            {
                $lookup: {
                    from        : "featuretags",
                    localField  : "feature_tags_id",
                    foreignField: "_id",
                    as          : "feature_tag_docs",
                },
            },

            // Terrain
            {
                $lookup: {
                    from        : "terraintypes",
                    localField  : "terrain_id",
                    foreignField: "_id",
                    as          : "terrain_docs",
                },
            },

            // Tenure
            {
                $lookup: {
                    from        : "tenuretypes",
                    localField  : "tenure_id",
                    foreignField: "_id",
                    as          : "tenure_doc",
                },
            },
            { $unwind: { path: "$tenure_doc", preserveNullAndEmptyArrays: true } },

            // Media (thumbnail only needs url + type)
            {
                $lookup: {
                    from        : "media",
                    localField  : "media_id",
                    foreignField: "_id",
                    as          : "media_docs",
                },
            },
        ];

        // ── 3. Post-lookup regex filters ───────────────────────────────────

        // Location: match state name OR any district name under that state
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "state.state"          : { $regex: search, $options: "i" } },
                        { "districts.district"   : { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        // Deal type: name is an array inside each doc → regex traverses array
        if (deal_type) {
            pipeline.push({
                $match: {
                    "deal_type_docs.name": { $regex: deal_type, $options: "i" },
                },
            });
        }

        // Terrain: same pattern
        if (terrain) {
            pipeline.push({
                $match: {
                    "terrain_docs.name": { $regex: terrain, $options: "i" },
                },
            });
        }

        // Title type: leasehold or freehold — regex so partial match also works
        if (title_type) {
            pipeline.push({
                $match: {
                    "tenure_doc.type": { $regex: title_type, $options: "i" },
                },
            });
        }

        // ── 4. Count pipeline (clone before pagination stages) ─────────────
        const count_pipeline = [...pipeline, { $count: "total" }];

        // ── 5. Pagination + projection ─────────────────────────────────────
        pipeline.push(
            { $skip: skip },
            { $limit: LIMIT },
            {
                $project: {
                    _id                  : 1,
                    listing_code         : 1,
                    status               : 1,
                    category             : 1,
                    utilization          : 1,
                    relation             : 1,
                    is_malay_reserve_land: 1,
                    unit                 : 1,
                    area                 : 1,
                    price_sqft           : 1,

                    // Total price: convert sqm → sqft if needed, then × price_sqft
                    total_price_myr: {
                        $round: [
                            {
                                $multiply: [
                                    "$price_sqft",
                                    {
                                        $cond: [
                                            { $eq: ["$unit", "sqm"] },
                                            { $multiply: ["$area", SQM_TO_SQFT] },
                                            "$area",
                                        ],
                                    },
                                ],
                            },
                            2,
                        ],
                    },

                    state   : "$state.state",
                    district: { $arrayElemAt: ["$districts.district", 0] },

                    // Flatten array-of-arrays (each doc's name/tag field is itself an array)
                    deal_types: {
                        $reduce: {
                            input       : "$deal_type_docs.name",
                            initialValue: [],
                            in          : { $concatArrays: ["$$value", "$$this"] },
                        },
                    },
                    feature_tags: {
                        $reduce: {
                            input       : "$feature_tag_docs.tag",
                            initialValue: [],
                            in          : { $concatArrays: ["$$value", "$$this"] },
                        },
                    },
                    terrain_types: {
                        $reduce: {
                            input       : "$terrain_docs.name",
                            initialValue: [],
                            in          : { $concatArrays: ["$$value", "$$this"] },
                        },
                    },

                    tenure_type: "$tenure_doc.type",

                    // Thumbnail: first "image" entry in first media doc
                    thumbnail: {
                        $let: {
                            vars: {
                                m: { $arrayElemAt: ["$media_docs", 0] },
                            },
                            in: {
                                $let: {
                                    vars: {
                                        idx: { $indexOfArray: ["$$m.media_type", "image"] },
                                    },
                                    in: {
                                        $cond: [
                                            { $gte: ["$$idx", 0] },
                                            { $arrayElemAt: ["$$m.media_url", "$$idx"] },
                                            null,
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            }
        );

        // ── 6. Execute in parallel ─────────────────────────────────────────
        const [listings, count_result] = await Promise.all([
            listingModel.aggregate(pipeline),
            listingModel.aggregate(count_pipeline),
        ]);

        const total = count_result[0]?.total ?? 0;

        return res.status(200).json({
            data: {
                listings,
                pagination: {
                    total,
                    page,
                    limit      : LIMIT,
                    total_pages: Math.ceil(total / LIMIT),
                },
            },
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};


// get all listings by admin

export const get_all_listings_by_admin = async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = 10;
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
        const { listing_id, status } = req.body;

        
        const listing = await listingModel.findByIdAndUpdate(
            listing_id,
            {
                $set: {
                    status
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!listing) {
            throw new NotFoundError("Listing not found.");
        }

        const { title , message} =NotificationTemplates.listingStatusChanged({
            listingCode : listing.listing_code,
            status 
        })
        await createNotification({

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
                status: listing.status
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
                        media_type: "$media.media_type",
                        media_name: "$media.media_name"
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


const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
) => {

    const R = 6371; // KM

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
};

// get listings by map
export const get_listing_by_radius = async (req, res, next) => {
    try {
       const {
    radius = 100,
    latitude,
    longitude,
} = req.query;

        if (!latitude || !longitude) {
            return next(new BadRequestError("Latitude and longitude are required."));
        }

        const center = {
            latitude: Number(latitude),
            longitude: Number(longitude),
        };

        const listings = await listingModel.aggregate([

            // Only active listings
            { $match: { status: "active" } },

            // Get location
            {
                $lookup: {
                    from: "locations",
                    localField: "location_id",
                    foreignField: "_id",
                    as: "location"
                }
            },
            { $unwind: "$location" },

            // Get media
            {
                $lookup: {
                    from: "media",
                    localField: "media_id",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { media_url: 1 } }
                    ],
                    as: "media"
                }
            },

            // Get state
            {
                $lookup: {
                    from: "states",
                    localField: "state_id",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { state: 1 } }
                    ],
                    as: "state"
                }
            },
            { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },

            // Get district
            {
                $lookup: {
                    from: "districts",
                    localField: "state_id",
                    foreignField: "state_id",
                    pipeline: [
                        { $limit: 1 },
                        { $project: { district: 1 } }
                    ],
                    as: "district"
                }
            },
            { $unwind: { path: "$district", preserveNullAndEmptyArrays: true } },

            // Get deal types
            {
                $lookup: {
                    from: "dealtypes",
                    localField: "deal_type_id",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { name: 1 } }
                    ],
                    as: "deal_types"
                }
            },

            // Get feature tags
            {
                $lookup: {
                    from: "featuretags",
                    localField: "feature_tags_id",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { tag: 1 } }
                    ],
                    as: "feature_tags"
                }
            },

            {
                $project: {
                    listing_id: "$_id",
                    listing_code: 1,
                    status: 1,
                    category: 1,
                    area: 1,
                    price_sqft: 1,
                    total_price: { $multiply: ["$area", "$price_sqft"] },
                    location: {
                        latitude: { $arrayElemAt: ["$location.location.coordinates", 1] },
                        longitude: { $arrayElemAt: ["$location.location.coordinates", 0] },
                    },
                    first_image: {
                        $arrayElemAt: [{ $arrayElemAt: ["$media.media_url", 0] }, 0]
                    },
                    state: "$state.state",
                    district: "$district.district",
                    deal_type: "$deal_types.name",
                    feature_tags: "$feature_tags.tag",
                }
            }

        ]);

        const filteredListings = listings
            .map(item => {
                const distance = calculateDistance(
                    center.latitude,
                    center.longitude,
                    Number(item.location.latitude),
                    Number(item.location.longitude),
                );
                return { ...item, distance_km: Number(distance.toFixed(2)) };
            })
            .filter(item => item.distance_km <= Number(radius))
            .sort((a, b) => a.distance_km - b.distance_km);

        return res.status(200).json({
            center,
            radius: `${radius} KM`,
            total: filteredListings.length,
            listings: filteredListings,
        });

    } catch (err) {
        next(err);
    }
};


export const deactivate_listing = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const { listing_id } = req.body;
        if ( !listing_id ) throw new BadRequestError(" Please enter listing_id ")
        const user_id = req.user.sub;

        const listing = await listingModel
            .findById(listing_id)
            .session(session);

        if (!listing) {
            throw new NotFoundError("Listing not found.");
        }


        // Already inactive
        if (listing.status === "inactive") {
            await session.abortTransaction();

            return res.status(200).json({
                message: "Listing is already inactive."
            });
        }

        // ---------------- DELETE CLOUDINARY FILES ----------------

        if (listing.media_id?.length) {

            const medias = await mediaModel.find({
                _id: { $in: listing.media_id }
            }).session(session);

            for (const media of medias) {

                if (!media.public_id?.length) continue;

                for (let i = 0; i < media.public_id.length; i++) {

                    const publicId = media.public_id[i];
                    const mediaType = media.media_type?.[i];

                    try {

                            await delete_files_from_cloudinary(publicId, {
                                resource_type: "image"
                            });

    

                    } catch (err) {
                        console.error(
                            `Cloudinary delete failed: ${publicId}`,
                            err.message
                        );
                    }
                }
            }

            // Delete media documents
            await mediaModel.deleteMany({
                _id: { $in: listing.media_id }
            }).session(session);

            listing.media_id = [];
        }

        // ---------------- UPDATE LISTING ----------------

        listing.status = "inactive";

        await listing.save({ session });

        await session.commitTransaction();

         const { title , message} =NotificationTemplates.listingDelete({
            listingCode : listing.listing_code,
            status : "inactive"
        })
        await createNotification({

    user_id: listing.user_id,

    listing_id: listing._id,

    notifiable_type: "Listing",

    title,

    message

});
        return res.status(200).json({
            message: "Listing deactivated successfully."
        });

    } catch (err) {

        await session.abortTransaction();
        next(err);

    } finally {

        session.endSession();

    }
};


// get all views and counts 
 export const get_all_views_count = async (req, res, next) => {
    try {

        const user_id = new mongoose.Types.ObjectId(req.user.sub);

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
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    total_views: 1,
                    total_clicks: 1
                }
            }

        ]);

        return res.status(200).json(
            result[0] || {
                total_views: 0,
                total_clicks: 0
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
        await createNotification({

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