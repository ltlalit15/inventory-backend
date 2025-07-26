
const stripe = require('stripe')('sk_test_51QjO3HAkiLZQygvD8kwZLwH5r0jExg8yautBgymqFOIjAC6wa1WSgzEuXKfzrWt40MhsFZhgATSn5AbPkJNMPFYf00PSEFqGrc');
const db = require('../config');

const endpointSecret = 'whsec_Pe11X6q8HwdWLSyZbJP7xn9z4JZoCkE';

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received event: ${event.type}`);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const status = paymentIntent.status;

    try {
      const updateQuery = 'UPDATE payments SET status = ? WHERE paymentIntentId = ?';
      await db.query(updateQuery, [status, paymentIntentId]);
      console.log(`DB updated: ${paymentIntentId} → ${status}`);
    } catch (err) {
      console.error('DB update error in webhook:', err.message);
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};


module.exports = {stripeWebhook};
