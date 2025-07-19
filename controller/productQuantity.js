const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');



// Increment Quantity
const incrementQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM productquantity WHERE userId = ? AND productId = ?",
      [userId, productId]
    );

    let quantity;

    if (rows.length > 0) {
      const currentQty = rows[0].quantity;
      quantity = currentQty + 1;

      await db.query(
        "UPDATE productquantity SET quantity = ? WHERE userId = ? AND productId = ?",
        [quantity, userId, productId]
      );

      return res.json({
        success: true,
        message: "Quantity incremented successfully",
        data: { userId, productId, quantity }
      });
    } else {
      quantity = 1;

      await db.query(
        "INSERT INTO productquantity (userId, productId, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
      );

      return res.json({
        success: true,
        message: "Quantity initialized to 1",
        data: { userId, productId, quantity }
      });
    }
  } catch (err) {
    console.error("❌ Increment Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: {}
    });
  }
};

// Decrement Quantity
const decrementQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM productquantity WHERE userId = ? AND productId = ?",
      [userId, productId]
    );

    if (rows.length > 0) {
      let currentQty = rows[0].quantity;
      let quantity = currentQty > 1 ? currentQty - 1 : 1;

      await db.query(
        "UPDATE productquantity SET quantity = ? WHERE userId = ? AND productId = ?",
        [quantity, userId, productId]
      );

      return res.json({
        success: true,
        message: "Quantity decremented successfully",
        data: { userId, productId, quantity }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Quantity not found",
        data: {}
      });
    }
  } catch (err) {
    console.error("❌ Decrement Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: {}
    });
  }
};



const getQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or productId in params',
        data: {}
      });
    }

    const [rows] = await db.query(
      `SELECT 
        pq.quantity,
        u.id AS userId, u.firstName, u.lastName, u.email,

        p.id AS productId, p.name AS productName, p.price, p.sku,
        p.categoryId, p.stockQuantity, p.description, p.image,

        c.name AS categoryName

      FROM productquantity pq
      LEFT JOIN user u ON pq.userId = u.id
      LEFT JOIN product p ON pq.productId = p.id
      LEFT JOIN category c ON p.categoryId = c.id
      WHERE pq.userId = ? AND pq.productId = ?`,
      [userId, productId]
    );

    if (rows.length > 0) {
      const row = rows[0];
      return res.json({
        success: true,
        message: 'Quantity fetched successfully',
        data: {
          quantity: row.quantity,
          user: {
            id: row.userId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email
          },
          product: {
            id: row.productId,
            name: row.productName,
            price: row.price,
            sku: row.sku,
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            stockQuantity: row.stockQuantity,
            description: row.description,
            image: row.image ? JSON.parse(row.image) : []
          }
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No quantity found for given user and product',
        data: {}
      });
    }

  } catch (err) {
    console.error('❌ getQuantity error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: {}
    });
  }
};



module.exports = {incrementQuantity, decrementQuantity, getQuantity}