import listingModel from "../models/listing.model.js";
import usersModel from "../models/users.model.js";
import { InternalServerError } from "./error.utils.js"

export const user_code_generator = async ( req , res )=>{
    try {        
        const last_user = await usersModel
        .findOne()
        .sort({ _id : -1  })
        .select("user_code")
        .lean()

        if ( !last_user ) return 'U001';
        const last_number = parseInt(last_user.user_code.slice(1));
        return `U${String(last_number+1).padStart(3 ,'0')}`
    }catch ( err ){
        throw new InternalServerError( err );
    }
}

export const listing_code_generator = async ( req , res )=>{
    try {        
        const last_listing = await listingModel
        .findOne()
        .sort({ _id : -1  })
        .select("listing_code")
        .lean()

        if ( !last_listing ) return 'U001';
        const last_number = parseInt(last_listing.listing_code.slice(1));
        return `L${String(last_number+1).padStart(3 ,'0')}`
    }catch ( err ){
        throw new InternalServerError( err );
    }
}