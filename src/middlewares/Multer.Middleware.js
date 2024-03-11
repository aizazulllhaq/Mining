import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads")
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}_${file.originalname}`.replace(/ /g, "_");
        cb(null, fileName);
    }
});

export const upload = multer({ storage });