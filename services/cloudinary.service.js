import cloudinary from "../config/cloudinary.js";

const CHUNK_SIZE = 20 * 1024 * 1024; 
const  CHUNKED_THRESHOLD = 20 * 1024 * 1024;
export const get_media_type = (format) => {
    const images = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const videos = ['mp4', 'mkv', 'avi', 'mov'];
    if (images.includes(format)) return 'image';
    if (videos.includes(format)) return 'video';
    return 'document';
};



export const upload_file = (file_buffer, folder) => {
    return new Promise((resolve, reject) => {

        const callback = (error, result) => {
            if (error) return reject(error);
            resolve({
                url       : result.secure_url,
                public_id : result.public_id,
                format    : result.format,
                size      : result.bytes
            });
        };

        const options = {
            folder,
            resource_type : "auto",
        };

        const stream = file_buffer.length > CHUNKED_THRESHOLD
            ? cloudinary.uploader.upload_chunked_stream(
                { ...options, chunk_size: CHUNK_SIZE }, callback
              )
            : cloudinary.uploader.upload_stream(
                options, callback
              );

        stream.end(file_buffer);
    });
};

export const upload_files_to_cloudinary = (files, folder) => {
    return Promise.all(
        files.map(file => upload_file(file.buffer, folder))
    );
};

export const delete_file = (public_id) => {
    return cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
};

export const delete_files_from_cloudinary = (public_ids) => {
    return Promise.all(public_ids.map(id => delete_file(id)));
};