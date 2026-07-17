import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 25
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

export const upload_listing_files = upload.fields([
  { name: 'geran_img', maxCount: 10 },
  { name: 'property_images', maxCount: 15 }
]);


export const upload_file_to_multer = upload


// export const upload_multiple = upload.array('images', 15);