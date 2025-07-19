const express = require('express');
const { createBanner, getAllBanners, updateBanner, deleteBanner } = require('../controller/banner');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload');  // Specify the folder where images will be stored
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);  // Get file extension
        const fileName = Date.now() + fileExtension;  // Use a unique name
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post('/createBanner', authMiddleware, createBanner);
router.get('/getAllBanners', getAllBanners);
router.patch('/updateBanner/:id', authMiddleware, updateBanner);
router.delete('/deleteBanner/:id', authMiddleware, deleteBanner);


module.exports = router;   









