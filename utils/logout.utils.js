import jwt from "jsonwebtoken";

const blackList = new Set();

export const add_to_blacklist = (token)=>{
    const decoded = jwt.decode(token);
    const expires_at = decoded.exp * 1000;
    blackList.add(token);
    const delay = expires_at - Date.now();
    if ( delay > 0 ){
        setTimeout(()=> blackList.delete(token), delay);
    }
};


export const is_blackList = (token)=>{
    return blackList.has(token);
}