import { geocoder } from "../config/geoCoder.js";


export const getCoordinates = async (district, state) => {
  const query = `${district}, ${state}, Malaysia`;

  const res = await geocoder.geocode(query);

  if (!res || res.length === 0) {
    throw new Error(`Location not found for: ${query}`);
  }
  return {
    latitude:  res[0].latitude.toString(),
    longitude: res[0].longitude.toString(),
    location:  res[0].formattedAddress,
  };
};