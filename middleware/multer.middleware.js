import multer from "multer"

const storage = multer.memoryStorage()
export const upload_file_to_multer = multer({ storage: storage , limits : { fileSize : 10 * 1024 * 1024 } })
