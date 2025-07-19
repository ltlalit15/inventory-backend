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


const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl = []; // default if no image

   
    // ✅ If image is selected, upload to Cloudinary
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'categories',
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
    }

    // ✅ Save to DB (can be null if no image)
    const [result] = await db.query('INSERT INTO category (name, image) VALUES (?, ?)', [name, imageUrl]);
    const insertedId = result.insertId;

    res.status(201).json({
      status: "true",
      message: "Category added successfully",
      data: {
        id: insertedId,
        name,
        image: imageUrl ? [imageUrl] : [] // ✅ always return array
      }
    });

  } catch (error) {
    console.error("❌ Error while adding category:", error);
    res.status(500).json({
      status: "false",
      message: "Server error while adding category",
      data: []
    });
  }
};


const getAllCategories = async (req, res) => {
  try {
    console.log("📥 Fetching all categories...");

    const [rows] = await db.query(`
      SELECT * FROM category 
    `);

    const formatted = rows.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: cat.image ? [cat.image] : [], // always return array
      createdAt: cat.createdAt
    }));

    res.status(200).json({
      status: "true",
      message: "Categories fetched successfully",
    //  total: formatted.length,
      data: formatted
    });

  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({
      status: "false",
      message: "Server error while fetching categories",
      data: []
    });
  }
};




const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    let imageUrl = [];

    // ✅ Upload new image if provided
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'categories',
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
    }

    // ✅ Get old data
    const [existing] = await db.query('SELECT * FROM category WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: "false", message: "Category not found" });
    }

    // ✅ Use old image if no new image uploaded
    const finalImage = imageUrl || existing[0].image;

    await db.query(
      'UPDATE category SET name = ?, image = ? WHERE id = ?',
      [name || existing[0].name, finalImage, id]
    );

    res.json({
      status: "true",
      message: "Category updated successfully",
      data: {
        id,
        name: name || existing[0].name,
        image: finalImage ? [finalImage] : []
      }
    });
  } catch (error) {
    console.error("❌ Error while updating category:", error);
    res.status(500).json({
      status: "false",
      message: "Server error while updating category",
      data: []
    });
  }
};



const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM category WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

  



module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };