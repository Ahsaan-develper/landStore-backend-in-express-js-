import mongoose from "mongoose";

import { BadRequestError, ConflictError, NotFoundError } from "../utils/error.utils.js";
import styleModel from "../models/style.model.js";
import state_sectionModel from "../models/state_section.model.js";
import containerModel from "../models/container.model..js";
import buttonModel from "../models/button.model.js";
import contentModel from "../models/content.model.js";
import card_dataModel from "../models/card_data.model.js";
import card_iconModel from "../models/card_icon.model.js";
import cardModel from "../models/card.model.js";
import testimonialModel from "../models/testimonial.model.js";
import { delete_file, get_media_type, upload_file } from "../services/cloudinary.service.js";
import mediaModel from "../models/media.model.js";
import menuModel from "../models/menu.model.js";
import cardCategoryModel from "../models/cardCategory.model.js";
import cardMetaDataModel from "../models/cardMetaData.model.js";
import { ReturnDocument } from "mongodb";


// create section 
export const create_section = async ( req  , res , next )=>{
    try {
        const { route , title , status , description }= req.body;
        const admin_id = req.user.sub;
        const is_existing_section = await state_sectionModel.findOne({ title }).select("_id").lean();
        if( is_existing_section ) throw new ConflictError("State section with this name already create")
        const section = await state_sectionModel.create({
            route ,
            title ,
            description,
            status : "active",
            admin_id
        });
        res.status(201).json({
            message : "Section is created ",
            section
        })
    }catch ( err ){
        next ( err );
    }
}

// get all sections 
export const get_all_section = async (req, res, next) => {
  try {
    const page  = Math.max(Number(req.query.page)  || 1,  1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip  = (page - 1) * limit;
    const [result] = await state_sectionModel.aggregate([
      {
        $facet: {
          metadata: [{ $count: "total_items" }],
          sections: [
            { $skip: skip },
            { $limit: limit },
            { $project: { title: 1, _id: 1 } }
          ]
        }
      }
    ]);

    const total_items = result.metadata[0]?.total_items || 0;
    const total_pages = Math.ceil(total_items / limit);

    if (page > total_pages && total_items > 0) {
      return res.status(400).json({ message: "Page does not exist" });
    }
     
       
    res.status(200).json({
      total_pages,
      total_items,
      current_page: page,
      sections: result.sections
    });

  } catch (err) {
    next(err);
  }
};


// state section area 

export const create_container = async ( req , res , next )=>{
    try {
        const {  section_id } = req.params;
        const { container_alignment , background_color , top , left , bottom , right }= req.body;
        const objId = new mongoose.Types.ObjectId(section_id)
        const is_exist_container = await containerModel.findOne({state_section_id : objId }).select("_id ").lean();
        if (is_exist_container ) throw new ConflictError(" For this state container already exist");
        const style = await styleModel.create({
            background_color ,
            padding : {
                top ,
                bottom ,
                left ,
                right
            }
        })
        const container = await containerModel.create({
            alignment :container_alignment,
            style_id : style._id,
            state_section_id : section_id
        });

        res.status(201).json({
            message  : "container data created ",
            style ,
            container
        })
    }catch ( err ){
        next ( err );
    }
}

export const get_container = async ( req , res , next )=>{
    try {
        const { id }= req.query;

const container = await containerModel.aggregate([
    {
        $match: {
            state_section_id: new mongoose.Types.ObjectId(id)
        }
    },
    {
        $lookup: {
            from: "styles",
            localField: "style_id",
            foreignField: "_id",
            as: "style"
        }
    },
    {
        $unwind: "$style"
    },
    {
        $project: {
            _id: 1,
            alignment: 1,
            style: {
                _id: 1,
                padding: 1,
                background_color: 1
            }
        }
    },
    {
        $limit: 1
    }
]);

res.status(200).json({
    container
})
}catch ( err ){
        next ( err);
    }
}



export const create_button = async ( req , res , next )=>{
    try {
        const { button_text , button_link , text_color , background_color , border_color , top , left , bottom , right}= req.body ;
        const { section_id } = req.params;
         const objId = new mongoose.Types.ObjectId(section_id)
        const is_exist_button = await buttonModel.findOne({state_section_id : objId }).select("_id ").lean();
        if (is_exist_button ) throw new ConflictError(" For this state section button already exist");
        const style = await styleModel.create({
            background_color ,
            border_color,
            padding : {
                top ,
                left ,
                bottom ,
                right ,
            }
        });

        const button = await buttonModel.create({
            style_id : style._id,
            button_text,
            button_color : text_color,
            button_link ,
            state_section_id : section_id
        });
        res.status(201).json({
            message : "Button style created",
            button ,
            style
        })
    }catch( err ){
        next ( err);
    }
}


// get button

export const get_button = async ( req , res , next )=>{
    try {
        const { id }= req.query;

const button = await buttonModel.aggregate([
    {
        $match: {
            state_section_id: new mongoose.Types.ObjectId(id)
        }
    },
    {
        $lookup: {
            from: "styles",
            localField: "style_id",
            foreignField: "_id",
            as: "style"
        }
    },
    {
        $unwind: "$style"
    },
    {
        $project: {
            _id: 1,
            button_text : 1,
            button_color : 1,
            button_link : 1,
            style: {
                _id: 1,
                padding: 1,
                background_color: 1,
                border_color : 1 
            }
        }
    },
    {
        $limit: 1
    }
]);


res.status(200).json({
    button
})

}catch ( err ){
        next ( err);
    }
}


// create content 

export const create_statistic_content = async ( req , res , next )=>{
    try {
        
        const { heading , heading_color , heading_alignment , card_gap , description , description_color  , description_alignment } = req.body ;
        const { section_id } = req.params;
        const objId = new mongoose.Types.ObjectId(section_id)
        const is_exist_statistic = await contentModel.findOne({state_section_id : objId }).select("_id ").lean();
        if (is_exist_statistic ) throw new ConflictError(" For this state section content already exist");
            let card_data ;
        if (heading  && heading_color && heading_alignment && description && description_color && description_alignment){
            card_data = await card_dataModel.create({
            heading ,
            heading_color ,
            heading_alignment  ,
            description ,
            description_color  ,
            description_alignment,
        });
        }
        
        
        const content = await contentModel.create({
            card_data_id : card_data?._id ,
            card_gap ,
            state_section_id: section_id,
        });

        res.status(201).json({
            message : "content created for state section",
            content ,
            card_data,
            
        })
    }catch ( err ){
        next ( err );
    }
}


// get content 


export const get_statistic_content = async ( req , res , next )=>{
    try {
        const { id }= req.query;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (Number(page - 1 ))* limit;
        
const [content] = await contentModel.aggregate([
    {
        $match: {
            state_section_id: new mongoose.Types.ObjectId(id)
        }
    },
    {
        $lookup: {
            from: "cardstyles",
            let : { 
                contentId : "$_id"
            },
            pipeline : [
                {
                    $match : {
                        $expr : {
                            $eq : [ "$content_id" , "$$contentId"]
                        }
                    }
                },
                {
                    $sort: {
                        _id :1 
                    }
                },
                {
                    $skip : skip
                },
                {
                    $limit : limit 
                }, {
                    $project : {
                        _id : 1 ,
                        card_name : 1 
                    }
                }
            ],
            as : "cards"
        }
    },
    {
        $project: {
            _id: 1,
            card_gap: 1,
            cards : 1
        }
    },
]);


res.status(200).json({
    content
})

}catch ( err ){
        next ( err);
    }
}

// get reviews content 


export const get_reviews_content = async ( req , res , next )=>{
    try {
        const { id }= req.query;
        
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (Number(page - 1 ))* limit;
        
const [content] = await contentModel.aggregate([
    {
        $match: {
            state_section_id: new mongoose.Types.ObjectId(id)
        }
    },
    {
        $lookup: {
            from: "carddatas",
            localField: "card_data_id",
            foreignField: "_id",
            as: "card_data"
        }
    },
    {
        $unwind: "$card_data"
    },
    {
        $lookup: {
            from: "cardstyles",
            let : { 
                contentId : "$_id"
            },
            pipeline : [
                {
                    $match : {
                        $expr : {
                            $eq : [ "$content_id" , "$$contentId"]
                        }
                    }
                },
                {
                    $sort: {
                        _id :-1 
                    }
                },
                {
                    $skip : skip
                },
                {
                    $limit : limit 
                }, {
                    $project : {
                        _id : 1 ,
                        card_name : 1 
                    }
                }
            ],
            as : "cards"
        }
    },
    {
        $project: {
            _id: 1,
            card_gap: 1,
            card_data_id : 1,
            card_data: {
                _id: 1,
                heading: 1,
                heading_color: 1,
                heading_alignment: 1,
                description : 1 ,
                description_color : 1 ,
                description_alignment : 1 ,
            },
            cards : 1
        }
    },
]);


res.status(200).json({
    content
})

}catch ( err ){
        next ( err);
    }
}

// create statistic card 

export const create_statistic_card = async ( req , res , next )=>{
    try {
        const { card_name , heading , heading_color , heading_alignment, sub_heading , sub_heading_color , sub_heading_alignment , description , description_color , description_alignment , top , left , bottom , right , background_color , border_color , icon_color , card_icon } = req.body ;
        const { section_id } = req.params;
        
        const is_card_exist = await cardModel.findOne({ card_name  , content_id  : section_id}).select("card_name content_id").lean();
        
        if ( is_card_exist?.card_name === card_name && section_id === is_card_exist?.content_id ) throw new ConflictError("Card with this name already exist , enter different name ");

                if ( card_icon  && !icon_color || !card_icon && icon_color  ) throw new BadRequestError(" Please provide both card_icon and icon_color ");

        const style = await styleModel.create({
            border_color ,
            background_color ,
            padding : {
                top ,
                bottom ,
                left ,
                right 
            }
        });

        const card_data = await card_dataModel.create({
            heading ,
            heading_color ,
            heading_alignment,
            description,
            description_color ,
            description_alignment,
            sub_heading ,
            sub_heading_color ,
            sub_heading_alignment
        })

        
        
        const card = await cardModel.create({
            content_id : section_id ,
            card_name ,
            style_id : style._id,
            card_data_id : card_data._id,

        });

        let icon  ;
        if ( card_icon && icon_color){
            icon = await card_iconModel.create({
                card_icon ,
                icon_color,
                card_id : card._id
            });
        }


        res.status(201).json({
            message : "New card is created",
            card,
            style ,
            card_data ,
            icon
        })
    }catch ( err ){
        next ( err );
    }
}


//  get single card data cards of statistic content 
export const get_single_cards = async (req, res, next) => {
    try {
        const { id } = req.query;

        const [card] = await cardModel.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },

            {
                $lookup: {
                    from: "styles",
                    localField: "style_id",
                    foreignField: "_id",
                    as: "style"
                }
            },

            {
                $lookup: {
                    from: "carddatas",
                    localField: "card_data_id",
                    foreignField: "_id",
                    as: "card_data"
                }
            },

            {
                $lookup: {
                    from: "icons",
                    localField: "_id",
                    foreignField: "card_id",
                    as: "icon"
                }
            },

           
            {
                $unwind: {
                    path: "$style",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $unwind: {
                    path: "$card_data",
                    preserveNullAndEmptyArrays: true
                }
            },

           
            {
                $project: {
                    _id: 1,
                    card_name: 1,

                    style: {
                        _id: 1,
                        background_color: 1,
                        border_color: 1,
                        padding: 1
                    },

                    card_data: {
                        _id: 1,
                        heading: 1,
                        heading_color: 1,
                        heading_alignment: 1,
                        sub_heading : 1 ,
                        sub_heading_alignment : 1 ,
                        sub_heading_color : 1 ,
                        description: 1,
                        description_color: 1,
                        description_alignment: 1
                    },

                    icon: 1
                }
            }
        ]);

        res.status(200).json({
            card: card || null
        });

    } catch (err) {
        next(err);
    }
};

// get testimonial content 

export const get_testimonial_content = async ( req , res , next )=>{
    try {
        const { id }= req.query;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (Number(page - 1 ))* limit;
        
const [content] = await contentModel.aggregate([
    {
        $match: {
            state_section_id: new mongoose.Types.ObjectId(id)
        }
    },
    {
        $lookup: {
            from: "carddatas",
            localField: "card_data_id",
            foreignField: "_id",
            as: "card_data"
        }
    },
    {
        $unwind: "$card_data"
    },
    {
        $lookup: {
            from: "testimonials",
            let : { 
                contentId : "$_id"
            },
            pipeline : [
                {
                    $match : {
                        $expr : {
                            $eq : [ "$content_id" , "$$contentId"]
                        }
                    }
                },
                {
                    $sort: {
                        _id : 1 
                    }
                },
                {
                    $skip : skip
                },
                {
                    $limit : limit 
                }, {
                    $project : {
                        _id : 1 ,
                        card_name : 1 
                    }
                }
            ],
            as : "testimonial"
        }
    },
    {
        $project: {
            _id: 1,
            card_gap: 1,
            card_data_id : 1,
            card_data: {
                _id: 1,
                heading: 1,
                heading_color: 1,
                heading_alignment: 1,
                description : 1 ,
                description_color : 1 ,
                description_alignment : 1 ,
            },
            testimonial : 1
        }
    },
]);


res.status(200).json({
    content
})

}catch ( err ){
        next ( err);
    }
}

// create testimonial card 

export const create_testimonial_card = async ( req , res , next )=>{
    try {
        const {testimonial_name,  testimonial , testimonial_alignment , testimonial_color  , customer , customer_alignment , customer_color , username , username_alignment , username_color   ,
            border_color ,
            background_color ,
                top , 
                bottom ,
                left ,
                right  }= req.body ;
        const { section_id } = req.params;
        
        const is_card_exist = await testimonialModel.findOne({ testimonial_name  }).select("testimonial_name").lean();
        
        if ( is_card_exist  ) throw new ConflictError("Card with this name already exist , enter different name ");
        const style = await styleModel.create({
            background_color ,
            border_color ,
            padding : {
                top , 
                bottom ,
                left ,
                right 
            }
        })
        const testimonial_data = await testimonialModel.create({
            testimonial ,
            testimonial_alignment ,
            testimonial_color ,
            testimonial_name ,
            customer ,
            customer_alignment , 
            customer_color,
            username,
            username_color ,
            username_alignment,
            style_id : style._id,
            content_id : section_id
        })

        res.status(201).json({
            testimonial_data ,
            style
        })
    }catch( err ){
        next ( err );
    }
}

// get testimonial single card 

    export const get_single_testimonial_card = async ( req , res , next )=>{
        try {
            const { id } = req.query;
            
            const testI_card = await testimonialModel.aggregate([
                {
                    $match : {
                        _id : new mongoose.Types.ObjectId(id)
                    }
                },{
                    $lookup : {
                        from : "styles",
                        localField : "style_id" ,
                        foreignField : "_id" ,
                        as : "style"
                    }
                },
                {
                    $unwind : "$style"
                },{
                    $project : {
                        
                            testimonial : 1 ,
                            testimonial_name : 1,
                            testimonial_alignment : 1 ,
                            testimonial_color : 1,
                            username : 1 ,
                            username_color : 1 ,
                            username_alignment : 1 ,
                            customer : 1 ,
                            customer_alignment :1 , 
                            customer_color : 1 ,
                        
                        style : {
                            border_color : 1 ,
                            padding : {
                                top : 1 , 
                                left : 1,
                                bottom : 1 ,
                                right : 1
                            } ,
                            background_color : 1 
                        }
                    }
                }
            ]);

            
            res.status(200).json({
                testI_card
            })
        }catch ( err ){
            next ( err );
        }
    }


// browse landstore content 

export const browse_map_content = async ( req , res  , next )=>{
    try {

    }catch ( err ){
        next ( err );
    }
}


// create broswer map content 


export const create_browse_map_content = async ( req , res , next )=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        
        const { heading , heading_color , heading_alignment , card_gap , description , description_color  , description_alignment  , top, left, bottom, right} = req.body ;
        const { section_id } = req.params;
        const objId = new mongoose.Types.ObjectId(section_id)
        const is_exist_statistic = await contentModel.findOne({state_section_id : objId }).select("_id ").lean();
        if (is_exist_statistic ) throw new ConflictError(" For this state section content already exist");
            let card_data ;
        if (heading  && heading_color && heading_alignment && description && description_color && description_alignment){
            [card_data] = await card_dataModel.create([{
            heading ,
            heading_color ,
            heading_alignment  ,
            description ,
            description_color  ,
            description_alignment,
        }] , {session});
        }
        let media = {};
        if ( req.file ){
            const file_data  = await upload_file(req.file.buffer , "img_video");
            [media] = await mediaModel.create([{
                media_url : file_data.url ,
                media_name : req.file.mimetype,
                media_type : get_media_type(file_data.format),
                public_id : file_data.public_id
            }] , { session})
        }
        
        const [style] = await styleModel.create([{
            padding: {
                top ,
                left ,
                bottom ,
                right 
            }
        }] , {session})
        
        const [content] = await contentModel.create([{
            card_data_id : card_data?._id ,
            card_gap ,
            state_section_id: section_id,
            media_id: media._id,
            style_id: style._id,
        }] , { session});
        await session.commitTransaction();
        res.status(201).json({
            message : "content created for state section",
            content ,
            card_data,
            media
        })
    }catch ( err ){
        await session.abortTransaction();
        next ( err );
    } finally {
        session.endSession()
    }
}


// get browse content data 
export const get_browse_content = async ( req , res , next)=>{
    try {
        const { id } = req.query;
        
            const [browse_data] = await contentModel.aggregate([
                {
                    $match : { state_section_id : new mongoose.Types.ObjectId(id) }
                }, 
                {
                    $lookup : {
                        from : "carddatas",
                        localField : "card_data_id" ,
                        foreignField : "_id", 
                        as :"card_data"
                    }
                },
                {
                    $unwind :  {path: "$card_data", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup : {
                        from : "styles",
                        localField : "style_id" ,
                        foreignField : "_id", 
                        as :"style_data"
                    }
                },
                {
                    $unwind : { path: "$style_data", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup : {
                        from : "media",
                        localField : "media_id" ,
                        foreignField : "_id", 
                        as :"media_data"
                    }
                },
                {
                    $unwind : { path: "$media_data", preserveNullAndEmptyArrays: true }
                },
                {
                    $project : {
                        card_data : {
                            heading :1 ,
                            heading_color : 1 ,
                            heading_alignment : 1 ,
                            description : 1 ,
                            description_color : 1 ,
                            description_alignment : 1 ,
                        },
                        style_data : {
                            padding : {
                                top :1 ,
                                right :1 ,
                                bottom:1 ,
                                left :1 ,
                            }
                        },
                        media_data : {
                            media_url : 1,
                            media_type : 1,
                        }
                    }
                }
            ])

            

            res.status(200).json({
                browse_data
            })
    }catch ( err ){
        next ( err );
    }
}

// create footer content 
export const create_footer_content = async ( req , res , next )=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        
        
        const { card_gap} = req.body ;
        const { section_id } = req.params;
        const objId = new mongoose.Types.ObjectId(section_id)
        const is_exist_statistic = await contentModel.findOne({state_section_id : objId }).select("_id ").lean();
        if (is_exist_statistic ) throw new ConflictError(" For this state section content already exist");

      let media ;
        if (req.file) {
            const file_data = await upload_file(req.file.buffer, "logo");
            [media] = await mediaModel.create([{
                media_url: file_data.url,
                media_name: req.file.mimetype,
                media_type: "logo",
                public_id: file_data.public_id
            }], { session });
        }
        
        const [content] = await contentModel.create([{
            card_gap ,
            state_section_id: section_id,
            media_id: media?._id,
        }] , { session});
        await session.commitTransaction();
        res.status(201).json({
            message : "content created for state section",
            content ,
            media
        })
    }catch ( err ){
        await session.abortTransaction();
        next ( err );
    } finally {
        session.endSession()
    }
}

// get footer content 

export const get_footer_content = async ( req , res , next )=>{
    try {
        const { id } = req.query;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (Number(page - 1 ))* limit;
        
        const [footer_data] = await contentModel.aggregate([
            {
                $match : {
                    state_section_id : new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from : "menus",
                    let : {
                        contentId : "$_id"
                    }, 
                    pipeline : [
                        {
                    $match : {
                        $expr : {
                            $eq : [ "$content_id" , "$$contentId"]
                        }
                    }
                },
                {
                    $sort: {
                        _id :1 
                    }
                },
                {
                    $skip : skip
                },
                {
                    $limit : limit 
                }, {
                    $project : {
                        _id : 1 ,
                        menu_name : 1 
                    }
                }
                    ], 
                    as : "cards"
                }
            },
            {
                $lookup : {
                    from : "media" , 
                    localField : "media_id",
                    foreignField : "_id", 
                    as :  "media_data"
                }
            }, 
            {
                $unwind : { path : "$media_data",  preserveNullAndEmptyArrays : true }
            },
            {
                $project : {
                    card_gap : 1 ,
                    media_data : {
                        media_url : 1  ,
                        media_type : 1
                    },
                    
                  cards  : 1 
                }
            }
        ]) ;

        res.status(200).json({
            footer_data
        })
    }catch ( err ){
        next ( err );
    }
}

// card menu add

export const create_menu_card = async ( req , res , next )=>{
    try {
        const { section_id } = req.params;
        const { menu , menu_color ,menu_alignment, top , left , bottom , right , background_color , border_color , menu_name  , link} = req.body ;
        const is_exist = await menuModel.findOne({ menu_name }).select("_id").lean();

        if ( is_exist) throw new ConflictError("Card with this name already exist ");
        const style = await styleModel .create({
            background_color , 
            border_color,
            padding : {
                top ,
                left ,
                right ,
                bottom,
            }
        })
        const menu_card_data = await menuModel.create({
            menu ,
            menu_name , 
            menu_color ,
            menu_alignment ,
            link ,
            content_id : section_id,
            style_id : style._id
        })
        res.status(201).json({
            message : "Menu card is created" ,
            style  ,
            menu_card_data
        })
    }catch( err ){
        next ( err );
    }
}


// get single menu card 

export const single_menu_card = async ( req , res , next )=>{
    try {
        const { id } = req.query ;
        const get_menu_card =await menuModel.aggregate([
            {
                $match : { 
                    _id : new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from : "styles",
                    localField : "style_id",
                    foreignField : "_id",
                    as : "styles" 
                }
            },
            {
                $project : {
                    menu : 1 ,
                    menu_name : 1 ,
                    menu_color : 1 ,
                    menu_alignment : 1 ,
                    link : 1 ,
                    styles : {
                        padding : {
                            top : 1 ,
                            right : 1 ,
                            left : 1 ,
                            bottom : 1 ,
                        },
                        border_color : 1,
                        background_color : 1 
                    }
                }
            }
        ]);

        res.status(200).json({
            get_menu_card
        })
    }catch ( err ){
        next ( err );
    }
}

// get content of news 

export const get_news_content = async ( req , res , next )=>{
    try {
        const {id} = req.query;
        const news_content = await contentModel.aggregate([
            {
                $match : {
                    state_section_id : new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from: "carddatas", 
                    localField :  "card_data_id", 
                    foreignField : "_id",
                    as : "card_data"
                }
            },
            {
                $unwind : { path : "$card_data" , preserveNullAndEmptyArrays : true }
            },

                {
                $lookup: {
                    from: "cardcategories",
                    localField: "_id",
                    foreignField: "content_id",
                    as: "categories"
                }
            },
            {
                $unwind : { path : "$categories" , preserveNullAndEmptyArrays : true }
            },
            {
                $project: {
                    _id: 1,
                    card_gap: 1,
                    card_data: {
                        heading: 1,
                        heading_color: 1,
                        heading_alignment: 1,
                        description: 1,
                        description_color: 1,
                        description_alignment: 1
                    },
                    categories: {
                        _id: 1,
                        category_name: 1
                    }
                }
            }
        ])

        res.status(200).json({
            news_content
        })
    }catch ( err ){
        next ( err );
    }
} 


// create category for news 
export const create_category = async ( req , res , next )=>{
    try {
        const { category_name }= req.body ;
        const { section_id } = req.params ;

        const is_exist = await cardCategoryModel.findOne({ category_name }).select("_id").lean();
        if ( is_exist) throw new ConflictError("Card category name already exist , please enter another name");

        const category = await cardCategoryModel.create({
            category_name ,
            content_id : section_id
        });

        res.status(201).json({
            category
        })

    }catch ( err ){
        next ( err );
    }
}


// get news category all data 
export const single_news_category_all_cards = async ( req , res , next )=>{
    try {
        const { id } = req.query ;
        const category_all_data = await cardCategoryModel.aggregate([
            { 
                $match : {
                    _id : new mongoose.Types.ObjectId(id)
            }
        }, 
        
        {
            $lookup : {
                from : "cardstyles",
                localField : "_id",
                foreignField : "card_category_id",
                as : "cards"
            }
        },
        {
            $unwind : { path : "$cards" , preserveNullAndEmptyArrays : true }
        },
        {
            $sort: {
            "cards.createdAt": -1
        }
        },
        {
            $project : {
                category_name  : 1 ,
                _id : 1 , 
                cards : {
                    _id :  1,
                    card_name : 1,
                    createdAt: 1
                }
            } 
        }
        ])

        if ( !category_all_data ) throw new NotFoundError("Category not found ");

        res.status(200).json({
            category_all_data 
        })
        
    }catch ( err ){
        next ( err );
    }
}


// create news for a categories

export const create_news = async ( req , res , next )=>{
    try {
        const { section_id } = req.params ;
        const {card_name , tag , heading , heading_color , heading_alignment , description ,  description_alignment, description_color , link , link_color , link_alignment , date , date_color , date_alignment , top , left , bottom , right , border_color , background_color }= req.body;
        const is_exist_card = await cardModel.findOne({   card_name, card_category_id: new mongoose.Types.ObjectId(section_id)}).select("card_name card_category_id").lean();
        if ( is_exist_card  ) throw new ConflictError(" News card with this name already exist ");
        let media ;
        if ( req.file ){
            let data = await upload_file(req.file.buffer , "news");
            media = await mediaModel.create ({
                media_name : req.file.mimetype ,
                media_url : data.url ,
                public_id: data.public_id,
                media_type : "image"
            })
        }

        const style = await styleModel.create({
            padding : {
                top , 
            left , 
            bottom , 
            right , 
            },
            border_color , 
            background_color,
        })
        const card_data = await card_dataModel.create({
            heading ,
            heading_color ,
            heading_alignment,
            description ,
            description_color ,
            description_alignment
        })
        const news = await cardModel.create({
            card_name ,
            card_category_id : section_id,
            media_id : media?._id,
            style_id : style?._id,
            card_data_id :  card_data?._id
        });

        const metadata = await cardMetaDataModel.create ({
            link , 
            link_color , 
            link_alignment , 
            date , 
            date_color , 
            date_alignment , 
            card_id : news?._id,
            tag

        })

        res.status(201).json({
            message  : "News is created",
            news,
            style ,
            card_data,
            metadata,
            media
        })
    }catch ( err ){
        next ( err );
    }
}




// get single news card details
export const get_single_news_detail = async ( req , res , next )=>{
    try {
        const { id } = req.query ;
        const news_detail = await cardModel.aggregate([
            {
                $match : {
                    _id  : new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from : "cardmetas",
                    localField : "_id",
                    foreignField : "card_id",
                    as: "cardmeta"
                }
            },
            {
                $unwind : { path : "$cardmeta" , preserveNullAndEmptyArrays : true }
            },
            {
                 $lookup : {
                    from : "styles",
                    localField : "style_id",
                    foreignField : "_id",
                    as: "style"
                }
            },
            {
                $unwind : { path : "$style" , preserveNullAndEmptyArrays : true }
            },
            {
                $lookup : {
                    from : "media",
                    localField : "media_id",
                    foreignField : "_id",
                    as: "media"
                }   
            },
            {
                $unwind : { path : "$media" , preserveNullAndEmptyArrays : true }
            },
        {
    $project: {
        _id: 1,
        card_name: 1,
        createdAt: 1,        
        image: "$media.media_url",
        heading: "$card_data.heading",
        description: "$card_data.description",
        style: {
            border_color: "$style.border_color",
            background_color: "$style.background_color",
            padding: "$style.padding"
        },
        link: "$meta.link",
        date: "$meta.date",
        tag:  "$meta.tag",
    }
}
        ]);
        if ( !news_detail ) throw new NotFoundError("News not found ");

        res.status(200).json({
            news_detail
        })
    }catch ( err ){
        next ( err );   
    }
}



// get all news data 
export const get_news_section_user = async (req, res, next) => {
    try {
        const { section_id } = req.params;
        const page  = Math.max(Number(req.query.page)  || 1,  1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip  = (page - 1) * limit;

        const result = await contentModel.aggregate([
            {
                $match: {
                    state_section_id: new mongoose.Types.ObjectId(section_id)
                }
            },

            {
                $lookup: {
                    from: "carddatas",
                    localField: "card_data_id",
                    foreignField: "_id",
                    as: "card_data"
                }
            },
            { $unwind: { path: "$card_data", preserveNullAndEmptyArrays: true } },

            // 3. Get categories
            {
                $lookup: {
                    from: "cardcategories",
                    localField: "_id",
                    foreignField: "content_id",
                    as: "categories"
                }
            },

            
            { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },

            
            {
                $lookup: {
                    from: "cardstyles",
                    let: { categoryId: "$categories._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$card_category_id", "$$categoryId"] }
                            }
                        },
                        // Card style → media
                        {
                            $lookup: {
                                from: "media",
                                localField: "media_id",
                                foreignField: "_id",
                                as: "media"
                            }
                        },
                        { $unwind: { path: "$media", preserveNullAndEmptyArrays: true } },

                        // Card style → card_data (heading, description)
                        {
                            $lookup: {
                                from: "carddatas",
                                localField: "card_data_id",
                                foreignField: "_id",
                                as: "card_data"
                            }
                        },
                        { $unwind: { path: "$card_data", preserveNullAndEmptyArrays: true } },

                        // Card style → style
                        {
                            $lookup: {
                                from: "styles",
                                localField: "style_id",
                                foreignField: "_id",
                                as: "style"
                            }
                        },
                        { $unwind: { path: "$style", preserveNullAndEmptyArrays: true } },

                        // Card style → meta (link, date, tag)
                        {
                            $lookup: {
                                from: "cardmetas",
                                localField: "_id",
                                foreignField: "card_id",
                                as: "meta"
                            }
                        },
                        { $unwind: { path: "$meta", preserveNullAndEmptyArrays: true } },

                        

                        
                        {
                            $project: {
                                _id: 1,
                                card_name: 1,
                                createdAt: 1, 
                                image: "$media.media_url",
                                heading: "$card_data.heading",
                                description: "$card_data.description",
                                style: {
                                    border_color: "$style.border_color",
                                    background_color: "$style.background_color",
                                    padding: "$style.padding"
                                },
                                link: "$meta.link",
                                date: "$meta.date",
                                tag:  "$meta.tag",
                            }
                        }
                    ],
                    as: "categories.cards"
                }
            },

            
            {
                $group: {
                    _id: "$_id",
                    card_gap: { $first: "$card_gap" },
                    card_data: { $first: "$card_data" },
                    categories: {
                        $push: {
                            category_name: "$categories.category_name",
                            cards: "$categories.cards"
                        }
                    }
                }
            }
        ]);

        if (!result || result.length === 0)
            throw new NotFoundError("News section not found");

        const section = result[0];

        
        const all_cards = section.categories
    .flatMap(cat =>
        (cat.cards || []).map(card => ({
            ...card,
            category: cat.category_name
        }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 

const total       = all_cards.length;
const paged_cards = all_cards.slice(skip, skip + limit);

        res.status(200).json({
            section: {
                heading:     section.card_data?.heading,
                description: section.card_data?.description,
                card_gap:    section.card_gap
            },
            cards: paged_cards,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        next(err);
    }
};
/////////////////////////////// editing part start here /////////////////////////////////

export const section_active_inactive = async ( req , res , next )=>{
    try {
        const { section_id } = req.params ;

        const toggle_status = await state_sectionModel.findByIdAndUpdate(
            section_id ,
            [
                {
                    $set : {
                        status : {
                            $cond : [
                                {
                                    $eq : ["$status" , "active"]
                                },
                                "inactive",
                                "active"
                            ]
                        }
                    }
                },
            ],
            {
                returnDocument : "after",
                updatePipeline: true
            }
        )
        if  ( !toggle_status ) throw new NotFoundError(" Section not found ");

        res.status(200).json({
            toggle_status
        })
    }catch ( err ){
        next ( err );
    }
}

// update state sections data 
    export const state_container_data_updated = async ( req , res , next )=>{
        try {
            const { section_id } = req.params;
            const { container_alignment, background_color , top , left , bottom , right } = req.body ;
             const container_update = {};
        const style_update = {
            padding : {}
        };


            if ( container_alignment ){
                container_update.alignment = container_alignment;
            }

            if ( background_color ){
                style_update.background_color = background_color;
            }

            if ( top ){
                style_update.padding.top = top;
            }
            if ( bottom ){
                style_update.padding.bottom = bottom;
            }
            if ( left ){
                style_update.padding.left = left;
            }
            if ( right ){
                style_update.padding.right = right;
            };

           
            const updated_data = await containerModel.findByIdAndUpdate( 
                section_id  , 
                {
                    $set : container_update
                },
                {
                    returnDocument: "after"
                }
            )

            if (!updated_data) {
    throw new NotFoundError("Container not found");
}

            const updated_style  = await styleModel.findByIdAndUpdate(
                updated_data.style_id  ,
                {
                    $set : style_update
                },
                {
                    returnDocument: "after"
                }
            )

            if ( !updated_style ) throw new NotFoundError(" Style not found ")

            res.status(200).json({
                updated_data,
                updated_style
            })

        }catch ( err ){
            next ( err );
        }
    }

// update an button data 
export const update_button = async (req, res, next) => {
    try {
        const { section_id } = req.params;

        const {
            background_color,
            top,
            left,
            right,
            bottom,
            button_link,
            button_text,
            border_color,
            text_color
        } = req.body;

        const button_update = {};
        const style_update = {};

        
        if (button_text !== undefined) {
            button_update.button_text = button_text;
        }

        if (button_link !== undefined) {
            button_update.button_link = button_link;
        }

        
        if (background_color !== undefined) {
            style_update.background_color = background_color;
        }

        if (border_color !== undefined) {
            style_update.border_color = border_color;
        }

        if (text_color !== undefined) {
            style_update.text_color = text_color;
        }

        if (top !== undefined) {
            style_update["padding.top"] = top;
        }

        if (left !== undefined) {
            style_update["padding.left"] = left;
        }

        if (right !== undefined) {
            style_update["padding.right"] = right;
        }

        if (bottom !== undefined) {
            style_update["padding.bottom"] = bottom;
        }

        // Update button
        const updated_button = await buttonModel.findByIdAndUpdate(
            section_id,
            {
                $set: button_update
            },
            {
                returnDocument: "after"
            }
        );

        if (!updated_button) {
            throw new NotFoundError("Button not found");
        }

        let updated_style = null;

        if (Object.keys(style_update).length > 0) {
            updated_style = await styleModel.findByIdAndUpdate(
                updated_button.style_id,
                {
                    $set: style_update
                },
                {
                    returnDocument: "after"
                }
            );

            if (!updated_style) {
                throw new NotFoundError("Style not found");
            }
        }

        res.status(200).json({
            updated_button,
            updated_style
        });

    } catch (err) {
        next(err);
    }
};

// content of state numbers show update 

export const content_statistic_update = async (req, res, next) => {
    try {
        const { section_id } = req.params;

        const {
            card_gap,
            heading,
            heading_color,
            heading_alignment,
            description,
            description_alignment,
            description_color,
            top ,
            left ,
            bottom,
            right
        } = req.body;

        const content_data = {};
        const card_data = {};
        const style_data = {};



        if (card_gap !== undefined) {
            content_data.card_gap = card_gap;
        }


        if (heading !== undefined) {
            card_data.heading = heading;
        }

        if (heading_color !== undefined) {
            card_data.heading_color = heading_color;
        }

        if (heading_alignment !== undefined) {
            card_data.heading_alignment = heading_alignment;
        }

        if (description !== undefined) {
            card_data.description = description;
        }

        if (description_color !== undefined) {
            card_data.description_color = description_color;
        }

        if (description_alignment !== undefined) {
            card_data.description_alignment = description_alignment;
        }


if (top !== undefined) {
    style_data["padding.top"] = top;
}

if (right !== undefined) {
    style_data["padding.right"] = right;
}

if (bottom !== undefined) {
    style_data["padding.bottom"] = bottom;
}

if (left !== undefined) {
    style_data["padding.left"] = left;
}

        const existing_content = await contentModel.findById(section_id);

        if (!existing_content) {
            throw new NotFoundError("Content not found");
        }
        

        const updated_style = await styleModel.findByIdAndUpdate(
            existing_content.style_id ,
            {
                $set : style_data 
            },
            {
                returnDocument : "after"
            }
        )



        const updated_content = await contentModel.findByIdAndUpdate(
            section_id,
            {
                $set: content_data
            },
            {
                returnDocument: "after"
            }
        );

        const updated_card_data = await card_dataModel.findByIdAndUpdate(
            existing_content.card_data_id,
            {
                $set : card_data
            },
            {
                returnDocument : "after"
            }
        )


let updated_media = null;

        if (req.file) {

            if (!existing_content.media_id) {
                throw new NotFoundError("Media not found for this content");
            }

        
            const existing_media = await mediaModel
                .findById(existing_content.media_id)
                .lean();

            if (!existing_media) {
                throw new NotFoundError("Media not found");
            }


            
            const old_public_id = existing_media.public_id?.[0];

            
            const media_data = await upload_file(
                req.file.buffer,
                "media"
            );
            
            const is_logo = req.file.fieldname==="logo";
            const mediaType = is_logo ? "logo" : get_media_type(media_data.format);
            updated_media = await mediaModel.findByIdAndUpdate(
                existing_content.media_id,
                {
                    $set: {
                        media_url: [media_data.url],
                        public_id: [media_data.public_id],
                        media_type: [mediaType],
                        media_name: [req.file.originalname]
                    }
                },
                {
                    returnDocument: "after"
                }
            );

            if (!updated_media) {
                throw new NotFoundError("Media update failed");
            }
            if (
                old_public_id &&
                old_public_id !== media_data.public_id
            ) {
                await delete_file(old_public_id);
            }
        }

        res.status(200).json({
            message: "Content updated successfully",
            updated_content,
            updated_card_data,
            updated_style,
            updated_media
        });

    } catch (err) {
        next(err);
    }
};