const db = require('../config');
const axios = require('axios');

const stripe = require('stripe')(
  'sk_test_51QjO3HAkiLZQygvD8kwZLwH5r0jExg8yautBgymqFOIjAC6wa1WSgzEuXKfzrWt40MhsFZhgATSn5AbPkJNMPFYf00PSEFqGrc'
);




const createCartPayment = async (req, res) => {
  try {
    const { userId, cartId, productId, totalAmount } = req.body;

    if (!userId || !cartId || !Array.isArray(cartId) || !totalAmount) {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }

    const amountInCents = Math.round(parseFloat(totalAmount) * 100);

    // ✅ Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId,
        cartItems: cartId.join(','),
        productId,
        type: 'cart_checkout',
      },
      description: `Payment for cart items: ${cartId.join(', ')}`,
    });
    const status = paymentIntent.status;

    // ✅ Insert cart payment into DB (optional)
    try {
      const insertQuery = `
        INSERT INTO payments (userId, cartIds, productId, amount, paymentIntentId, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await db.query(insertQuery, [
        userId,
        cartId.join(','),
        productId,
        totalAmount,
        paymentIntent.id,
        status 
      ]);
    } catch (dbErr) {
      console.error('DB Insert Error (payments):', dbErr);
      // continue without breaking response
    }

    // ✅ Send Stripe response
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      status,
      message: 'PaymentIntent created for cart checkout'
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

const confirmPaymentStatus = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Update DB with final status
    await db.query(
      'UPDATE payments SET status = ? WHERE paymentIntentId = ?',
      [intent.status, paymentIntentId]
    );

    res.json({ status: intent.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const getAllUserCartPaymentData = async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM user');

    const userDataWithPayments = await Promise.all(
      users.map(async (user) => {
        const userIdStr = String(user.id);

        const [payments] = await db.query(
          'SELECT * FROM payments WHERE userId = ?', [userIdStr]
        );

        if (!payments.length) return null;

        // ✅ Join cart with product table to get product name
        const [cartItems] = await db.query(
          `SELECT 
              cart.*, 
              product.name AS productName 
           FROM cart 
           JOIN product ON cart.productId = product.id 
           WHERE cart.userId = ?`,
          [userIdStr]
        );

        return {
          userId: userIdStr,
          userInfo: user,
          cart: cartItems,
          payments: payments
        };
      })
    );

    const filteredData = userDataWithPayments.filter(Boolean);

    res.status(200).json({
      success: true,
      message: "Retrieved users with payments only",
      data: filteredData
    });

  } catch (error) {
    console.error('Error fetching user/cart/payment/product data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





const deletePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const [existing] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Delete payment
    await db.query('DELETE FROM payments WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: "Delete data successfully",
      message: `Payment with ID ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};






module.exports = {createCartPayment, getAllUserCartPaymentData, deletePaymentById, confirmPaymentStatus};
