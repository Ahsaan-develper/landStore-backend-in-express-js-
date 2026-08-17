import multer from "multer";
import { BadRequestError } from "../utils/error.utils.js";

const IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

const DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

export const footerMulter = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 30 * 1024 * 1024 
    },
    fileFilter ( req , file , cb ){
        if ( !IMAGE_TYPES.includes(file.mimetype)){
            return cb ( new BadRequestError("Only images are allowed"))
        }
        cb(null , true);
    }
})

// ---------------- Profile Upload ----------------

const profileMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new BadRequestError("Only images are allowed."));
        }
        cb(null, true);
    }
});

export const upload_profile = profileMulter.single("image");
export const upload_footer = footerMulter.single("logo");



const listingMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB per file
    }
});

export const upload_listing = listingMulter.fields([
    {
        name: "property_images",
        maxCount: 15
    },
    {
        name: "geran_doc",
        maxCount: 11
    }
]);



const messageMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 
    }
});


export const upload_message_files = messageMulter.array("files", 11);




const file_filter = (req, file, cb) => {
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime"
  ];

  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};


export const upload_image_video_multer = multer({
  storage : multer.memoryStorage(), 
  fileFilter : file_filter,
  limits     : {
    fileSize : 50 * 1024 * 1024,  // 50MB
    files    : 1                   // single file only
  }
});