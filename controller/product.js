const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const logActivity = require('../utils/logActivity')

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dkqcqrrbp',
    api_key: '418838712271323',
    api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

const createProduct = async (req, res) => {
  try {
    const { name, price, sku, categoryId, stockQuantity, description } = req.body;
    let images = [];

    // Upload multiple images to Cloudinary
    if (req.files && req.files.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'products',
          resource_type: 'image'
        });
        images.push(result.secure_url);
      }
    }

    // Save product
    const [insertResult] = await db.query(
      `INSERT INTO product (name, price, sku, categoryId, stockQuantity, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, price, sku, categoryId, stockQuantity, description, JSON.stringify(images)]
    );

    const [rows] = await db.query(`SELECT * FROM product WHERE id = ?`, [insertResult.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...rows[0],
        image: rows[0].image ? JSON.parse(rows[0].image) : []
      }
    });
  } catch (err) {
    console.error("❌ Create product error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.name AS category_name 
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
    `);

    const formatted = rows.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sku: p.sku,
      categoryId: p.categoryId,
      category_name: p.category_name,
      stockQuantity: p.stockQuantity,
      description: p.description,
      image: p.image ? JSON.parse(p.image) : []
    }));

    res.json({ success: true, message: "Reterived All Data", data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

const getAllInventoryProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.name AS category_name 
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
    `);

    const formatted = rows.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sku: p.sku,
      categoryId: p.categoryId,
      category_name: p.category_name,
      stockQuantity: p.stockQuantity,
      description: p.description,
      image: p.image ? JSON.parse(p.image) : []
    }));

    res.json({ success: true, message: "Reterived All Data", data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};



const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        p.*, 
        c.name AS category_name 
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = rows[0];

    res.json({
      success: true,
      message: "Retrieved data",
      data: {
        ...product,
        image: product.image ? JSON.parse(product.image) : []
      }
    });

  } catch (err) {
    console.error("Get Product Error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};




const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing product
    const [existingRows] = await db.query(`SELECT * FROM product WHERE id = ?`, [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const existingProduct = existingRows[0];

    // Destructure with fallback to existing values
    const {
      name = existingProduct.name,
      price = existingProduct.price,
      sku = existingProduct.sku,
      categoryId = existingProduct.categoryId,
      stockQuantity = existingProduct.stockQuantity,
      description = existingProduct.description
    } = req.body;

    let images = [];

    // Upload new images if provided
    if (req.files && req.files.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'products',
          resource_type: 'image'
        });
        images.push(result.secure_url);
      }
    } else {
      images = existingProduct.image ? JSON.parse(existingProduct.image) : [];
    }

    // Update product
    await db.query(
      `UPDATE product SET name=?, price=?, sku=?, categoryId=?, stockQuantity=?, description=?, image=? WHERE id=?`,
      [name, price, sku, categoryId, stockQuantity, description, JSON.stringify(images), id]
    );

    const [updatedRows] = await db.query(`SELECT * FROM product WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        ...updatedRows[0],
        image: updatedRows[0].image ? JSON.parse(updatedRows[0].image) : []
      }
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};



const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM product WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};




module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getAllInventoryProducts };
