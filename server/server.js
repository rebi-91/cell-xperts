// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ONE ENDPOINT - THAT'S ALL YOU NEED
// app.post('/create-checkout-session', async (req, res) => {
//   try {
//     const { amount = 50 } = req.body; // Default $50

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: 'School Fees Payment',
//             },
//             unit_amount: amount * 100, // $ to cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: 'http://localhost:5173/payment-success',
//       cancel_url: 'http://localhost:5173/payment-cancel',
//     });

//     res.json({ url: session.url });
    
//   } catch (error) {
//     console.log('Error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Start server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Dummy Product Data
const products = [
  {
    id: 1,
    name: "Premium Laptop",
    description: "High-performance laptop for professionals",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    category: "Electronics"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    description: "Noise-cancelling Bluetooth headphones",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-400&h=300&fit=crop",
    category: "Audio"
  },
  {
    id: 3,
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitor",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    category: "Wearables"
  },
  {
    id: 4,
    name: "Gaming Console",
    description: "Next-gen gaming console with 4K support",
    price: 499.99,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
    category: "Gaming"
  },
  {
    id: 5,
    name: "Coffee Maker",
    description: "Automatic espresso machine",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    category: "Home"
  },
  {
    id: 6,
    name: "Backpack",
    description: "Water-resistant laptop backpack",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    category: "Accessories"
  }
];

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customerEmail, customerName } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    console.log('Creating checkout for:', items.length, 'items');
    console.log('Total amount:', totalAmount, 'GBP');

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image],
          metadata: {
            productId: item.id.toString(),
            category: item.category
          }
        },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout-cancel`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'IE'],
      },
      billing_address_collection: 'required',
      metadata: {
        customerName: customerName || 'Guest',
        totalItems: items.length.toString(),
        totalAmount: totalAmount.toString(),
        orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      custom_text: {
        submit: {
          message: "Thank you for your order! You'll receive a confirmation email shortly."
        }
      },
      allow_promotion_codes: true,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'gbp',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500, // £5.00
              currency: 'gbp',
            },
            display_name: 'Express shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
      ],
    });

    res.json({ 
      sessionId: session.id,
      url: session.url,
      publicKey: process.env.STRIPE_PUBLIC_KEY 
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      hint: 'Check your Stripe test keys'
    });
  }
});

// Get Checkout Session Details
app.get('/api/checkout-session/:id', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ['line_items', 'customer']
    });

    res.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total / 100,
      currency: session.currency,
      customer_email: session.customer_email,
      customer_details: session.customer_details,
      shipping_details: session.shipping_details,
      line_items: session.line_items,
      metadata: session.metadata,
      created: new Date(session.created * 1000).toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    products: products.length,
    currency: 'GBP'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛒 E-commerce Store Backend`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📦 Products: ${products.length} items`);
  console.log(`💳 Currency: GBP (£)`);
  console.log(`🔗 API: http://localhost:${PORT}/api/products`);
});