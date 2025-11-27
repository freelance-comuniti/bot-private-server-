const db = require('../database/db');

class UserHandler {
  
  // Add premium user
  async addPremiumUser(chatId, targetUserId) {
    try {
      // Cek apakah user sudah ada
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE user_id = ?', 
        [targetUserId]
      );
      
      if (existingUsers.length > 0) {
        // Update ke premium
        await db.query(
          'UPDATE users SET role = ? WHERE user_id = ?',
          ['premium', targetUserId]
        );
        
        global.bot.sendMessage(chatId, 
          `✅ User \`${targetUserId}\` berhasil diupgrade ke Premium!\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // Buat user baru premium
        await db.query(
          `INSERT INTO users (user_id, first_name, role, invited_by) 
           VALUES (?, ?, ?, ?)`,
          [targetUserId, 'Premium User', 'premium', chatId.toString()]
        );
        
        global.bot.sendMessage(chatId,
          `✅ User premium \`${targetUserId}\` berhasil ditambahkan!\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
      }
      
      // Kirim notifikasi ke user yang ditambahkan
      try {
        global.bot.sendMessage(targetUserId,
          `🎉 Selamat! Anda sekarang adalah Premium User!\n\nAkses fitur premium telah diaktifkan.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
      } catch (notifError) {
        console.log('Cannot send notification to user:', notifError.message);
      }
      
    } catch (error) {
      console.error('Error adding premium user:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal menambahkan user premium: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // Add regular user
  async addRegularUser(chatId, targetUserId) {
    try {
      // Cek apakah user sudah ada
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE user_id = ?', 
        [targetUserId]
      );
      
      if (existingUsers.length > 0) {
        global.bot.sendMessage(chatId,
          `ℹ️ User \`${targetUserId}\` sudah terdaftar sebagai ${existingUsers[0].role}.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      // Buat user baru member
      await db.query(
        `INSERT INTO users (user_id, first_name, role, invited_by) 
         VALUES (?, ?, ?, ?)`,
        [targetUserId, 'Member User', 'member', chatId.toString()]
      );
      
      global.bot.sendMessage(chatId,
        `✅ User member \`${targetUserId}\` berhasil ditambahkan!\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
      
    } catch (error) {
      console.error('Error adding regular user:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal menambahkan user: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // List all users
  async listAllUsers(chatId) {
    try {
      const users = await db.query(
        'SELECT * FROM users WHERE is_active = TRUE ORDER BY role DESC, join_date DESC'
      );
      
      if (users.length === 0) {
        global.bot.sendMessage(chatId,
          `📭 Belum ada user yang terdaftar.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      let userList = `📋 **ALL USERS** (${users.length})\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      users.forEach((user, index) => {
        const badge = user.role === 'premium' ? '👑' : '👤';
        const status = user.is_active ? '🟢' : '🔴';
        userList += `${badge} \`${user.user_id}\` - ${user.role} ${status}\n`;
      });
      
      userList += `\n🔧 *Bot by RizzXploit • JCN Community*`;
      
      global.bot.sendMessage(chatId, userList, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error listing users:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal mengambil daftar user: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // List premium users only
  async listPremiumUsers(chatId) {
    try {
      const premiumUsers = await db.query(
        'SELECT * FROM users WHERE role = ? AND is_active = TRUE ORDER BY join_date DESC',
        ['premium']
      );
      
      if (premiumUsers.length === 0) {
        global.bot.sendMessage(chatId,
          `👑 Belum ada user premium.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      let premiumList = `👑 **PREMIUM USERS** (${premiumUsers.length})\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      premiumUsers.forEach((user, index) => {
        premiumList += `${index + 1}. \`${user.user_id}\` - Bergabung: ${new Date(user.join_date).toLocaleDateString('id-ID')}\n`;
      });
      
      premiumList += `\n🔧 *Bot by RizzXploit • JCN Community*`;
      
      global.bot.sendMessage(chatId, premiumList, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error listing premium users:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal mengambil daftar premium: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }
}

module.exports = new UserHandler();
