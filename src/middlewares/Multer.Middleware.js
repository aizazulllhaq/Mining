import multer from 'multer';
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve("public", "uploads"))
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}_${file.originalname}`.replace(/ /g, "_");
        cb(null, fileName);
    }
});

export const upload = multer({ storage });