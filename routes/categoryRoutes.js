const express = require('express');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controller/category');
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



router.post('/createCategory', authMiddleware, createCategory);
router.get('/getAllCategories', getAllCategories);
router.patch('/updateCategory/:id', authMiddleware, updateCategory);
router.delete('/deleteCategory/:id', authMiddleware, deleteCategory);


module.exports = router;    








