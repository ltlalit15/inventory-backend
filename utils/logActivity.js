    const db = require('../config');
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    const multer = require('multer');
    require('dotenv').config();
    const path = require('path');
    const nodemailer = require('nodemailer');
    const cloudinary = require('cloudinary').v2;




  const logActivity = async (req, memberId, activity, module) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const deviceBrowser = req.headers['user-agent'];

  try {
    await db.query(
      `INSERT INTO activitylogs (memberId, activity, module, ipAddress, deviceBrowser)
       VALUES (?, ?, ?, ?, ?)`,
      [memberId, activity, module, ip, deviceBrowser]
    );
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};


    module.exports = logActivity;