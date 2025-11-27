const moment = require('moment');

class Formatter {
  
  // Format user information
  formatUserInfo(user) {
    const roleBadge = user.role === 'premium' ? '👑' : '👤';
    const status = user.is_active ? '🟢' : '🔴';
    
    return {
      short: `${roleBadge} \`${user.user_id}\` - ${user.role}`,
      detailed: `**User ID:** \`${user.user_id}\`\n` +
                `**Role:** ${user.role} ${roleBadge}\n` +
                `**Status:** ${status}\n` +
                `**Join Date:** ${moment(user.join_date).format('DD/MM/YYYY')}\n` +
                `**Data Collected:** ${user.data_collected}\n` +
                `**Links Shared:** ${user.links_shared}\n` +
                `**Last Active:** ${moment(user.last_active).format('DD/MM/YYYY HH:mm')}`
    };
  }

  // Format data information
  formatDataInfo(data) {
    return `**Timestamp:** ${moment(data.timestamp).format('DD/MM/YYYY HH:mm:ss')}\n` +
           `**IP Address:** \`${data.ip_address}\`\n` +
           `**Device:** ${data.device_type}\n` +
           `**Country:** ${data.country}\n` +
           `**User Agent:** ${data.user_agent?.substring(0, 50) || 'Unknown'}...`;
  }

  // Format link information
  formatLinkInfo(link) {
    const typeBadge = link.link_type === 'premium' ? '💎' : '🌐';
    const status = link.is_active ? '🟢' : '🔴';
    
    return `**Link Code:** \`${link.link_code}\`\n` +
           `**Type:** ${link.link_type} ${typeBadge}\n` +
           `**Status:** ${status}\n` +
           `**Clicks:** ${link.click_count}\n` +
           `**Data Collected:** ${link.data_collected}\n` +
           `**Created:** ${moment(link.created_at).format('DD/MM/YYYY')}\n` +
           `**Expires:** ${link.expires_at ? moment(link.expires_at).format('DD/MM/YYYY') : 'Never'}`;
  }

  // Format statistics for display
  formatStats(stats) {
    if (!stats) return '❌ Tidak ada data statistik.';
    
    return `📈 **SYSTEM STATISTICS**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
           `👥 **Users:**\n` +
           `• Total: ${stats.totalUsers}\n` +
           `• Premium: ${stats.premiumUsers}\n` +
           `• Member: ${stats.memberUsers}\n` +
           `• Active Today: ${stats.usersToday}\n\n` +
           
           `📊 **Data:**\n` +
           `• Total: ${stats.totalData}\n` +
           `• Today: ${stats.dataToday}\n` +
           `• Avg/User: ${stats.dataPerUser}\n\n` +
           
           `🔗 **Links:**\n` +
           `• Active: ${stats.totalLinks}\n\n` +
           
           `🕒 **Last Updated:** ${moment().format('DD/MM/YYYY HH:mm:ss')}`;
  }

  // Format error messages
  formatError(error, context = '') {
    const contextText = context ? ` (${context})` : '';
    return `❌ **Error${contextText}:**\n\`\`\`\n${error.message || error}\n\`\`\`\n\nSilakan coba lagi atau hubungi support.`;
  }

  // Format success messages
  formatSuccess(message, context = '') {
    const contextText = context ? ` **${context}**` : '';
    return `✅${contextText}:\n${message}`;
  }

  // Format numbers with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Add bot signature to any message
  addSignature(message) {
    return message + `\n\n🔧 *Bot by RizzXploit • JCN Community*`;
  }
}

module.exports = new Formatter();
