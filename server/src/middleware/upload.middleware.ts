import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,

    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
    },

    fileFilter(req, file, cb) {

        const allowedMimeTypes = [
            "application/pdf",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "image/png",

            "image/jpeg",

            "text/plain",
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error("Unsupported file type")
            );
        }
    },
});