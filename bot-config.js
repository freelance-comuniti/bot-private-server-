const TelegramBot = require('node-telegram-bot-api');
const bubbleHandler = require('./handlers/bubble-handler');

const token = process.env.BOT_TOKEN;

// Create bot instance dengan webhook mode
const bot = new TelegramBot(token);

// Store bot instance globally untuk dipakai di file lain
global.bot = bot;

// Handle incoming messages via webhook
bot.on('message', (msg) => {
  console.log(`📨 Received message from ${msg.from.id}: ${msg.text}`);
  
  // Handle /start command
  if (msg.text === '/start') {
    bubbleHandler.showMainMenu(msg);
    return;
  }
  
  // Handle other text messages
  bubbleHandler.handleTextMessage(msg);
});

// Handle callback queries (button clicks)
bot.on('callback_query', (query) => {
  bubbleHandler.handleCallbackQuery(query);
});

// Error handling
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

console.log('✅ Bot configured in WEBHOOK mode');

module.exports = bot;