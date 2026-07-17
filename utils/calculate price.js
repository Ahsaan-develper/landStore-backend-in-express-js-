const SQFT_PER_ACRE = 43560;


export const calculatePrice = (area, unit, pricePerUnit) => {
    if (!area || !pricePerUnit) throw new Error("Area and price are required");
    if (unit !== "sqft" && unit !== "acres") throw new Error("Unit must be 'sqft' or 'acres'");
    
    const totalPrice = area * pricePerUnit;
    return Math.round(totalPrice * 100) / 100;
};