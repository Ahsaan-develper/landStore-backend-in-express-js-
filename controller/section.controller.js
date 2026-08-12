import mongoose from "mongoose";

import { upload_file } from "../services/cloudinary.service.js";
import { ConflictError } from "../utils/error.utils.js";
import styleModel from "../models/style.model.js";
import state_sectionModel from "../models/state_section.model.js";
import containerModel from "../models/container.model..js";
import buttonModel from "../models/button.model.js";
import contentModel from "../models/content.model.js";
import card_dataModel from "../models/card_data.model.js";


// create section 
export const create_section = async ( req  , res , next )=>{
    try {
        const { route , title , status , description }= req.body;
        const admin_id = req.user.sub;
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


// create content 

export const create_statistic_content = async ( req , res , next )=>{
    try {
        const { heading , heading_color , heading_alignment , card_gap , description , description_color  , description_alignment } = req.body ;
        const { section_id } = req.params;
        const objId = new mongoose.Types.ObjectId(section_id)
        const is_exist_statistic = await contentModel.findOne({state_section_id : objId }).select("_id ").lean();
        if (is_exist_statistic ) throw new ConflictError(" For this state section content already exist");
        const card_data = await card_dataModel.create({
            heading , 
            heading_color ,
            heading_alignment  , 
            description ,
            description_color  ,
            description_alignment
        });

        const content = await contentModel.create({
            card_data_id : card_data?._id ,
            card_gap ,
            state_section_id: section_id
        });

        res.status(201).json({
            message : "content created for state section",
            content ,
            card_data
        })
    }catch ( err ){
        next ( err );
    }
}