import { InternalServerError, NotFoundError } from "../middleware/error.middleware.js"
import entityTypeModel from "../models/entityType.model.js";


// create an entity


export const add_entity = async ( req , res )=>{
    try {
        const { name } = req.body ;
        const admin_id = req.user.sub;
        const new_entity = await entityTypeModel.create({ name , admin_id})
        res.status(201).json({
            message : "Entity is created",
            new_entity
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}

// get all entities

export const get_all_entities = async ( req , res )=>{
    try {
        const entities = await entityTypeModel.aggregate([
            {
                $sort : { createdAt : -1}
            },
            {
                $project :{
                    name : 1 
                }
            }
        ]);

        if ( !entities ) throw new NotFoundError(" No entity is exist ");
        res.status(200).json({
            entities
        })
    }catch( err ){
        throw new InternalServerError( err );
    }
}



// update an entity 


export const update_entity = async ( req , res )=>{
    try {
        const { id } = req.params;
        const { name } = req.body ;
        const new_entity = await entityTypeModel.findByIdAndUpdate( id , {$set : { name : name} } ,{ new: true, runValidators: true } )
        if ( !new_entity ) throw new NotFoundError(" Entity not found ");
        res.status(201).json({
            message : "Entity is updated",
            new_entity
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}



// delete an entity

export const delete_entity = async ( req , res )=>{
    try {
        const { id }  = req.params;
        const new_entity = await entityTypeModel.findByIdAndDelete( id )
        if ( !new_entity ) throw new NotFoundError(" Entity not found ");
        res.status(201).json({
            message : "Entity is deleted",
            new_entity
        })
    }catch ( err ){
        throw new InternalServerError( err );
    }
}