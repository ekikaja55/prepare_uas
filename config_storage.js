const multer = require('multer')
const path = require('path')
const fs = require('fs')

const toByte = {
    KB: (n) => n * 1024,
    MB: (n) => n * 1024 * 1024
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userName = req.user.username.split(" ")[0] || "user"
        const folder = path.join(__dirname, 'uploads', userName)

        //pastikan folder ada, kalo gada otomatis buat baru
        fs.mkdirSync(folder, { recursive: true })

        //simpen disini
        cb(null, folder)
    },
    filename: (req, file, cb) => {
        const nameFile = path.basename(file.originalname, path.extname(file.originalname)).split(" ")[0]
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${nameFile}_${Date.now()}${ext}`);
    }
})

const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase()
    const validExt = /\.(jpg|jpeg|png)$/
    const validMime = ['image/jpeg', 'image/jpg', 'image/png']
    const isExtValid = validExt.test(fileExt)
    const isMimeValid = validMime.includes(file.mimetype)

    if (isExtValid && isMimeValid) {
        cb(null, true)
    } else {
        cb(new Error("Hanya file .jpg, .jpeg, .png yang diperbolehkan"), false)
    }
}

const uploadSingle = multer({
    storage,
    limits: { fileSize: toByte.MB(2) },
    fileFilter
})

module.exports = uploadSingle


/**
 * in case kalo mau lebih kompleks
 * const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const fileFilter = (req, file, callback) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const fileExtension =
        path.extname(file.originalname).toLowerCase();
    const checkExtName = allowedFileTypes.test(fileExtension);
    const checkMimeType = allowedFileTypes.test(file.mimetype);

    if (checkExtName && checkMimeType) {
        callback(null, true);
    } else {
        callback("Error: File type not supported", false);
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
})

atau

const uploadMany = multer({
  storage,
  limits: { fileSize: toByte.MB(2) },
  fileFilter
}).array("images", 5); // bisa sampai 5 gambar, sesuaikan sesuai kebutuhan

module.exports = upload
 */