import countryList from "country-codes-list";
import { InternalServerError, NotFoundError } from "../middleware/error.middleware.js";

export const countries_phone_codes = (req, res) => {
  try {
    const countries = countryList.customArray({
    name: "{countryNameEn}",
    code: "{countryCode}",
    phoneCode: "+{countryCallingCode}",
  });
  if ( !countries ) throw new NotFoundError(" Data of country code not exist");

  res.status(200).json({
    success: true,
    count: countries.length,
    data: countries,
  });

  }catch ( err ){
    throw new InternalServerError( err);
  }
};