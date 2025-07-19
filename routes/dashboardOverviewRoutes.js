const express = require('express');
const { getDashboardOverview } = require('../controller/dashboardOverview');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();


router.get('/getDashboardOverview', getDashboardOverview);




module.exports = router;    
