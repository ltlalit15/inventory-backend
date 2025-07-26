const express = require('express');
const { createCartPayment, getAllUserCartPaymentData, deletePaymentById, confirmPaymentStatus } = require('../controller/stripe');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

router.post('/createCartPayment', createCartPayment);
router.get('/getAllUserCartPaymentData',  getAllUserCartPaymentData);
router.delete('/deletePaymentById/:id',  deletePaymentById);
router.post('/confirmPaymentStatus', confirmPaymentStatus);


module.exports = router;














