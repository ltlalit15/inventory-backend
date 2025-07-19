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

const getDashboardOverview = async (req, res) => {
  try {
    // ✅ Total Products (Current Month)
    const [productResult] = await db.query(`
      SELECT COUNT(*) AS count FROM product
      WHERE MONTH(createdAt) = MONTH(CURDATE()) 
      AND YEAR(createdAt) = YEAR(CURDATE())
    `);

    const [lastProductResult] = await db.query(`
      SELECT COUNT(*) AS count FROM product
      WHERE MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
      AND YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH)
    `);

    const totalProducts = productResult[0].count;
    const lastProducts = lastProductResult[0].count;
    const productGrowth = lastProducts === 0 ? 100 : (((totalProducts - lastProducts) / lastProducts) * 100).toFixed(1);

    // ✅ Total Users (Current Month)
    const [userResult] = await db.query(`
      SELECT COUNT(*) AS count FROM user 
      WHERE MONTH(createdAt) = MONTH(CURDATE()) 
      AND YEAR(createdAt) = YEAR(CURDATE())
    `);

    const [lastUserResult] = await db.query(`
      SELECT COUNT(*) AS count FROM user
      WHERE MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
      AND YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH)
    `);

    const totalUsers = userResult[0].count;
    const lastUsers = lastUserResult[0].count;
    const userGrowth = lastUsers === 0 ? 100 : (((totalUsers - lastUsers) / lastUsers) * 100).toFixed(1);

    // ✅ Stock Level Trend (Last 7 Months)
    const [stockTrend] = await db.query(`
      SELECT 
        MONTHNAME(createdAt) AS month,
        COUNT(*) AS total 
      FROM product 
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY MONTH(createdAt)
      ORDER BY MONTH(createdAt)
    `);

    const stockLabels = stockTrend.map(row => row.month);
    const stockData = stockTrend.map(row => row.total);

    // ✅ Final Response
    return res.json({
      status: true,
      message: "Reterived data",
      totalProducts: {
        count: totalProducts,
        change: parseFloat(productGrowth)
      },
      totalUsers: {
        count: totalUsers,
        change: parseFloat(userGrowth)
      },
      stockLevelTrends: {
        labels: stockLabels,
        data: stockData
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


module.exports = { getDashboardOverview };
