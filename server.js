require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bot = require('./bot-config');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
db.connect();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🤖 Freelance Bot Server is Running!',
    author: 'RizzXploit - JCN Community',
    status: 'Active'
  });
});

// Webhook route for Telegram
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Set webhook endpoint (untuk setup awal)
app.get('/set-webhook', async (req, res) => {
  try {
    const webhookUrl = `${process.env.WEBHOOK_URL}/webhook`;
    const result = await bot.setWebHook(webhookUrl);
    res.json({ 
      success: true, 
      message: 'Webhook set successfully',
      webhookUrl: webhookUrl,
      result: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 Bot by RizzXploit • JCN Community`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Webhook setup: http://localhost:${PORT}/set-webhook`);
});

module.exports = app;