const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');


const addToCart = async (req, res) => {
  try {
    const { userId, productId, price, quantity } = req.body;

    // Check if product already in cart
    const [existing] = await db.query(
      "SELECT * FROM cart WHERE userId = ? AND productId = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Product already in cart" });
    }

    await db.query(
      "INSERT INTO cart (userId, productId, price, quantity) VALUES (?, ?, ?, ?)",
      [userId, productId, price, quantity]
    );

    res.status(200).json({ status: "true", message: "Product added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const [cartItems] = await db.query(
      `SELECT 
         c.*, 
         p.name AS productName, p.image, p.description, 
         u.firstName, u.lastName, u.email 
       FROM cart c
       JOIN product p ON c.productId = p.id
       JOIN user u ON c.userId = u.id
       WHERE c.userId = ?`,
      [userId]
    );

    // Clean image field: remove JSON string and extract actual URL
    const cleanedItems = cartItems.map((item) => {
      try {
        const imageArray = JSON.parse(item.image); 
        item.image = imageArray[0] || "";        
      } catch (e) {
        item.image = "";
      }
      return item;
    });

    res.status(200).json({
      status: "true",
      message: "Retrieved data",
      data: cleanedItems,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const updateCart = async (req, res) => {
  try {
    const { id, userId, productId, action } = req.body;

    const [cart] = await db.query(
      "SELECT * FROM cart WHERE id = ? AND userId = ? AND productId = ?",
      [id, userId, productId]
    );

    if (cart.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    let quantity = parseInt(cart[0].quantity);
    const actionValue = parseInt(action); // Convert to number

    if (isNaN(actionValue) || (actionValue !== 1 && actionValue !== -1)) {
      return res.status(400).json({ message: "Invalid action value. Use 1 or -1" });
    }

    // Apply increment/decrement logic
    quantity += actionValue;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity cannot be less than 1" });
    }

    await db.query(
      "UPDATE cart SET quantity = ? WHERE id = ?",
      [quantity.toString(), id]
    );

    res.status(200).json({
      status: "true",
      message: "Cart quantity updated successfully",
      newQuantity: quantity
    });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM cart WHERE id = ?", [id]);

    res.status(200).json({ status: "true", message: "Cart item deleted" });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { addToCart, getCartByUserId, updateCart, deleteCartItem };