const express = require('express');
const { incrementQuantity, decrementQuantity, getQuantity  } = require('../controller/productQuantity');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();

router.post('/incrementQuantity', authMiddleware, incrementQuantity);
router.post('/decrementQuantity', authMiddleware, decrementQuantity);
router.get('/getQuantity/:userId/:productId', authMiddleware, getQuantity);
// router.get('/getEventById/:id', authMiddleware, getEventById);
// router.get('/getEventSummary', authMiddleware, getEventSummary);

// router.patch('/updateEvent/:id', authMiddleware, updateEvent);
// router.delete('/deleteEvent/:id', authMiddleware, deleteEvent);


module.exports = router;






