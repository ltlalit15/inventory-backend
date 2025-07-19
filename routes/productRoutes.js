const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getAllInventoryProducts } = require('../controller/product');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

router.post('/createProduct', authMiddleware, createProduct);
router.get('/getAllProducts',  getAllProducts);
router.get('/getProductById/:id', getProductById);
router.patch('/updateProduct/:id', authMiddleware, updateProduct);
router.delete('/deleteProduct/:id', authMiddleware, deleteProduct);
router.get('/getAllInventoryProducts',  getAllInventoryProducts);


module.exports = router;














