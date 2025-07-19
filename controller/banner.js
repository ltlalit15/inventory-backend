const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dkqcqrrbp',
    api_key: '418838712271323',
    api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});



const createBanner = async (req, res) => {
  try {
   // const { image } = req.body;
    let imageUrl = [];

    if (req.files && req.files.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'banners',
          resource_type: 'image'
        });
        imageUrl.push(result.secure_url);
      }
    }

    const [result] = await db.query(
      'INSERT INTO banner (image) VALUES (?)',
      [JSON.stringify(imageUrl)]
    );

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: {
        id: result.insertId,
        //name,
        image: imageUrl
      }
    });
  } catch (err) {
    console.error("Error in createBanner:", err);
    res.status(500).json({ success: false, message: 'Server error', data: [] });
  }
};


const getAllBanners = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banner');

    const banners = rows.map(b => ({
      id: b.id,
      name: b.name,
      image: b.image ? JSON.parse(b.image) : []
    }));

    res.json({ success: true, message: "Reterived All data", data: banners });
  } catch (err) {
    console.error("Error in getAllBanners:", err);
    res.status(500).json({ success: false, message: 'Server error', data: [] });
  }
};


const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
   // const { name } = req.body;
    let imageUrl = [];

    const [oldRows] = await db.query('SELECT * FROM banner WHERE id = ?', [id]);
    if (oldRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found', data: [] });
    }

    if (req.files && req.files.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'banners',
          resource_type: 'image'
        });
        imageUrl.push(result.secure_url);
      }
    } else {
      imageUrl = oldRows[0].image ? JSON.parse(oldRows[0].image) : [];
    }

    await db.query('UPDATE banner SET image = ? WHERE id = ?', [
      //name || oldRows[0].name,
      JSON.stringify(imageUrl),
      id
    ]);

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: {
        id: Number(id),
       // name: name || oldRows[0].name,
        image: imageUrl
      }
    });
  } catch (err) {
    console.error("Error in updateBanner:", err);
    res.status(500).json({ success: false, message: 'Server error', data: [] });
  }
};


const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM banner WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};



module.exports = { createBanner, getAllBanners, updateBanner, deleteBanner };
