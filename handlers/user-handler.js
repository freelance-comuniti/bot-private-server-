const { User } = require('../database/models');

class UserHandler {
  
  // Add premium user
  async addPremiumUser(chatId, targetUserId) {
    try {
      // Cek apakah user sudah ada
      let user = await User.findOne({ user_id: targetUserId });
      
      if (user) {
        // Update ke premium
        user.role = 'premium';
        await user.save();
        
        global.bot.sendMessage(chatId, 
          `✅ User \`${targetUserId}\` berhasil diupgrade ke Premium!\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // Buat user baru premium
        user = new User({
          user_id: targetUserId,
          first_name: 'Premium User',
          role: 'premium',
          invited_by: chatId.toString()
        });
        await user.save();
        
        global.bot.sendMessage(chatId,
          `✅ User premium \`${targetUserId}\` berhasil ditambahkan!\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
      }
      
      // Kirim notifikasi ke user yang ditambahkan (jika bot punya akses)
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
      let user = await User.findOne({ user_id: targetUserId });
      
      if (user) {
        global.bot.sendMessage(chatId,
          `ℹ️ User \`${targetUserId}\` sudah terdaftar sebagai ${user.role}.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      // Buat user baru member
      user = new User({
        user_id: targetUserId,
        first_name: 'Member User',
        role: 'member',
        invited_by: chatId.toString()
      });
      await user.save();
      
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
      const users = await User.find({ is_active: true }).sort({ role: -1, join_date: -1 });
      
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
      const premiumUsers = await User.find({ 
        role: 'premium', 
        is_active: true 
      }).sort({ join_date: -1 });
      
      if (premiumUsers.length === 0) {
        global.bot.sendMessage(chatId,
          `👑 Belum ada user premium.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      let premiumList = `👑 **PREMIUM USERS** (${premiumUsers.length})\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      premiumUsers.forEach((user, index) => {
        premiumList += `${index + 1}. \`${user.user_id}\` - Bergabung: ${user.join_date.toLocaleDateString('id-ID')}\n`;
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