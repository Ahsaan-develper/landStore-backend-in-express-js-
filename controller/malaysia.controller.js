import { malaysia } from "../data/constants/malaysiaStats.js";
import { InternalServerError, NotFoundError } from "../middleware/error.middleware.js";

export const get_all_malaysia_state = async ( req , res )=>{
    try {
     const states = malaysia.map(({ state, code, districts }) => ({
  state,
}));
if ( !states ) throw new NotFoundError(" The states data not exist ");
    res.status(200).json({
        states
    })
    }catch( err ){
        throw new InternalServerError( err );
    }
}

export const get_all_malaysia_states_district = async ( req , res )=>{
    try {
        const { state} = req.body ;
        const found = malaysia.find(
            (item) => item.state.toLowerCase() === state.toLowerCase()
        )
if (!found) {
    return res.status(404).json({ success: false, message: "State not found" });
  }

  res.status(200).json({
    success: true,
    state: found.state,
    count: found.districts.length,
    data: found.districts,
  });

    }catch( err ){
        throw new InternalServerError( err );
    }
}