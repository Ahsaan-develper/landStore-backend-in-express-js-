import { BadRequestError, InternalServerError, NotFoundError, UnAuthorizedError } from "../middleware/error.middleware.js";
import newsModel from "../models/news.model.js";
import { deleteFromCloudinary, upload_to_cloudinary } from "../services/cloudinary.js";


// create news 


export const create_news = async ( req , res )=>{
    const { title , description , small_description , source , type } = req.body;
    try {
        const admin_id = req.user.sub;
        if ( !req.file) throw new BadRequestError(" Please upload one file")
        const { url , public_id } = await upload_to_cloudinary(req.file.buffer , req.file.mimetype);
       const news= await newsModel.create({
            title ,
            source ,
            type ,
            description,
            small_description,
            img : {
                url ,
                public_id
            },
            status  : "published",
            admin_id 
        })

        res.status(201).json({
            message : "News is created ",
            news
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}

// get all news by pagination

export const get_all_news = async( req , res )=>{
    const { page } = req.body;
    try {
        let limit = 3 * page ;
        let skip = limit -3 ;
          const [result]=  await newsModel.aggregate([
                {
                    $facet : {
                        data : [
                            { $match : { status : "published"}},
                            { $sort : { createdAt : -1 }},
                            { $skip : skip },
                            { $limit : limit},
                            {
                                $project : {
                                title: 1,
                                type: 1,
                                small_description: 1,
                                img: 1,
                                admin_id: 1,
                                createdAt: 1
                                }
                            }
                        ],
                        total : [
                            { $count : "count"}
                        ]
                    }
                }
            ]);

            const news = result.data
            const totalNews = result.total[0]?.count || 0;
        const totalPages = Math.ceil(totalNews / limit);

        res.status(200).json({
            success: true,
            limit :  news.length,
            totalNews,
            totalPages,
            currentPage: page,
            data: news
        });

    }catch( err ){
        throw new InternalServerError( err );
    }
}


// update an news 

export const get_single_news = async ( req , res )=>{
    const { id } = req.params;
    try{
        const news = await newsModel.findById( id );
        res.status(200).json({
            news
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}


// update an news 

export const update_news = async ( req , res )=>{
    const { id } = req.params;
    const { title , source , type  , description , small_description } = req.body ;
    try {
        let updated_field = {};
        if ( title ) updated_field.title = title;
        if ( source ) updated_field.source = source;
        if ( type ) updated_field.type = type;
        if ( description ) updated_field.description = description;
        if ( small_description ) updated_field.small_description = small_description;

        if ( req.file ){
            const news = await newsModel.findById( id ).select("img");
            if (!news) throw new NotFoundError("News not found");
            if ( news.img?.public_id){
                await deleteFromCloudinary(news.img.public_id);
            }
            const result = await upload_to_cloudinary(req.file.buffer, req.file.mimetype);
            updated_field.img = { url: result.url, public_id: result.public_id };
        }
        const updated_news = await newsModel.findByIdAndUpdate(
                    id,
                    { $set: updated_field },
                    { new: true, runValidators: false } 
                );
        
                if (!updated_field) throw new NotFoundError("News not found");
        
                res.status(200).json({
                    message: "User updated successfully",
                    updated_news
                });
        
    }catch ( err ){
        throw new InternalServerError( err );
    }
}


// make a draft

export const draft_news = async ( req , res )=>{
    const { title , description , small_description , source , type } = req.body
    try {
        const  admin_id = req.user.sub; 
        if ( !req.file) throw new BadRequestError(" Please upload one file")
        const { url , public_id } = await upload_to_cloudinary(req.file.buffer , req.file.mimetype);
       const news= await newsModel.create({
            title ,
            source ,
            type ,
            description,
            small_description,
            img : {
                url ,
                public_id
            },
            status  : "draft",
            admin_id
        })

        res.status(201).json({
            message : "News is created ",
            news
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}

// get all draft 

export const get_all_draft = async ( req , res )=>{
    const { page } = req.body;
    const admin_id =  req.user.sub;
    try {
const limit = 3;
const skip = (page - 1) * limit;

const drafts = await newsModel.aggregate([
    {
   $match: {
    $or: [
        { status: "draft" },
        { admin_id: admin_id }
    ]
}
    },
    {
        $sort: { createdAt: -1 }
    },
    {
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit }
            ],
            total: [
                { $count: "count" }
            ]
        }
    }
]);

const data = drafts[0].data;
const total = drafts[0].total[0]?.count || 0;
const total_pages = Math.ceil(total / limit);

res.status(200).json({
    data,
    pagination: {
        current_page: page,
        total_pages,
        total_items: total,
        per_page: limit
    }
});
    }catch( err ){
        throw new InternalServerError( err );
    }
}

// update an draft to published 

export const publish_news = async (req, res) => {
    try {
        const { id } = req.params;

        const news = await newsModel.findById(id).select("status admin_id");

        if (!news) throw new NotFoundError("News not found");

        if (news.status === "public") 
            return res.status(400).json({ success: false, message: "News is already public" });

        if (news.admin_id.toString() !== req.user.sub) 
            throw new UnAuthorizedError("You can only publish your own news");

        const updated = await newsModel.findByIdAndUpdate(
            id,
            { $set: { status: "published" } },
            { new: true }
        ).select("title status createdAt");
        res.status(200).json({
            success: true,
            message: "News published successfully",
            data: {
                id: updated._id,
                title: updated.title,
                status: updated.status,
            }
        });

    } catch (err) {
        throw new InternalServerError(err.message);
    }
};

// delete an news
export const delete_news = async ( req , res )=>{
    const { id } = req.params;
    try {
        const news = await newsModel.findByIdAndDelete(id);
        if (news.img?.public_id){
            await deleteFromCloudinary(news.img.public_id)
        }

        res.status(200).json({
            message : " News is deleted"
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}
