const express = require('express');
const { addToCart, getCartByUserId, updateCart, deleteCartItem, getUserCartWithPayments } = require('../controller/cart');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();

router.post('/addToCart', authMiddleware, addToCart);
router.get('/getCartByUserId/:userId', getCartByUserId);
router.patch('/updateCart', authMiddleware, updateCart);
router.delete('/deleteCartItem/:id', authMiddleware, deleteCartItem);
router.get('/getUserCartWithPayments/:userId', getUserCartWithPayments);



module.exports = router;  





