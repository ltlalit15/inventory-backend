const express = require('express');
const { stripeWebhook } = require('../controller/webhook');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();




// Stripe requires raw body for webhook verification, so do NOT use express.json() here
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;

















