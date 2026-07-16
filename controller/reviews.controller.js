import { InternalServerError, NotFoundError } from "../middleware/error.middleware.js"
import reviewsModel from "../models/reviews.model.js";



// create an entity


export const add_review = async ( req , res )=>{
    try {
        const { name  , username , description} = req.body ;
        const admin_id = req.user.sub;
        const new_entity = await reviewsModel.create({ name  , username , description, admin_id})
        res.status(201).json({
            message : "Review is created",
            new_entity
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}

// get all entities

export const get_all_review = async ( req , res )=>{
    try {
        const { page } = req.body ;
        let limit = 3;
        let skip = (page -1 ) * 3 ;
        const reviews = await reviewsModel.aggregate([
            {
                $sort : { createdAt : -1}
            },
            {
                $skip : skip
            },
            {
                $limit : limit
            },
            {
                $project :{
                    name : 1 ,
                    username : 1 ,
                    description : 1
                }
            }
        ]);

        if ( !reviews ) throw new NotFoundError(" No Review is exist ");
        res.status(200).json({
            reviews
        })
    }catch( err ){
        throw new InternalServerError( err );
    }
}



// update an entity 


export const update_review = async ( req , res )=>{
    try {
        const { id } = req.params;
        const { name  , username , description} = req.body ;
        let updated_data ={};
        if ( name ) updated_data.name = name ;
        if ( username ) updated_data.username = username ;
        if ( description ) updated_data.description = description ;
        const new_entity = await reviewsModel.findByIdAndUpdate( id , {$set :  updated_data  } ,{ new: true, runValidators: true } )
        if ( !new_entity ) throw new NotFoundError(" Review not found ");
        res.status(201).json({
            message : "Review is updated",
            new_entity
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}



// delete an entity

export const delete_review = async ( req , res )=>{
    try {
        const { id }  = req.params;
        const old_review= await reviewsModel.findByIdAndDelete( id )
        if ( !old_review ) throw new NotFoundError(" Review not found ");
        res.status(201).json({
            message : "Review is deleted",
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}