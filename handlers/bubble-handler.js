const userHandler = require('./user-handler');
const dataHandler = require('./data-handler');
const linkHandler = require('./link-handler');

class BubbleHandler {
  
  // [KEEP ALL PREVIOUS METHODS...]

  // UPDATE: Handle text messages dengan semua fitur
  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    console.log(`📝 Handling text: ${text} from ${chatId}`);
    
    switch (text) {
      // Main menus
      case "👥 USER MANAGEMENT":
        this.showUserManagementMenu(chatId);
        break;
      case "📊 DATA MANAGEMENT":
        this.showDataManagementMenu(chatId);
        break;
      case "🔗 LINK SHARING":
        this.showLinkSharingMenu(chatId);
        break;
      case "🛠️ UTILITIES":
        this.showUtilitiesMenu(chatId);
        break;
      case "📈 MY STATS":
        await dataHandler.showUserStats(chatId);
        break;
      case "ℹ️ HELP":
        this.showHelpMenu(chatId);
        break;

      // User management actions
      case "➕ ADD PREM":
        global.bot.sendMessage(chatId,
          `👑 **TAMBAH USER PREMIUM**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nSilakan kirim ID Telegram yang akan dijadikan premium:\n\nContoh: 1234567890\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        this.setWaitingForInput(chatId, 'add_premium');
        break;
      case "➕ ADD USER":
        global.bot.sendMessage(chatId,
          `👤 **TAMBAH USER MEMBER**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nSilakan kirim ID Telegram yang akan ditambahkan:\n\nContoh: 1234567890\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        this.setWaitingForInput(chatId, 'add_user');
        break;
      case "📋 LIST USER":
        await userHandler.listAllUsers(chatId);
        break;
      case "👑 PREMIUM LIST":
        await userHandler.listPremiumUsers(chatId);
        break;

      // Data management actions
      case "👀 VIEW DATA":
        await dataHandler.viewPersonalData(chatId);
        break;
      case "💎 VIEW PREMIUM":
        await dataHandler.viewPremiumData(chatId);
        break;
      case "🗑️ DELETE DATA":
        global.bot.sendMessage(chatId,
          `🗑️ **HAPUS DATA**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nFitur hapus data spesifik akan segera hadir.\n\nSementara, hubungi admin untuk bantuan.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        break;

      // Link sharing actions
      case "🌐 BAGIKAN LINK":
        await linkHandler.generateMemberLink(chatId);
        break;
      case "💎 LINK VVIP":
        await linkHandler.generatePremiumLink(chatId);
        break;
      case "📨 UNDANG USER":
        await linkHandler.generateInviteCode(chatId);
        break;
      case "🔄 REFRESH":
        this.showMainMenu(msg);
        break;

      // Utilities actions
      case "⚙️ SETTINGS":
        global.bot.sendMessage(chatId,
          `⚙️ **SETTINGS**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nPengaturan akan segera tersedia.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        break;
      case "📞 SUPPORT":
        global.bot.sendMessage(chatId,
          `📞 **SUPPORT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nButuh bantuan? Hubungi:\n\n👤 Admin: @RizzXploit\n🏷️ Community: JCN Community\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        break;
      case "🔐 LOGOUT":
        global.bot.sendMessage(chatId,
          `🔐 **LOGOUT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nFitur logout akan segera hadir.\n\n🔧 *Bot by RizzXploit • JCN Community*`,
          { parse_mode: 'Markdown' }
        );
        break;

      // Back buttons
      case "🔙 BACK TO MAIN":
        this.showMainMenu(msg);
        break;

      default:
        if (this.isWaitingForInput(chatId)) {
          await this.handleUserInput(chatId, text);
        } else {
          global.bot.sendMessage(chatId, 
            "❌ Perintah tidak dikenali. Silakan pilih menu di bawah.",
            { reply_markup: { remove_keyboard: true } }
          );
          this.showMainMenu(msg);
        }
    }
  }

  // NEW: Track user input state
  userInputState = new Map();

  setWaitingForInput(chatId, action) {
    this.userInputState.set(chatId.toString(), action);
  }

  isWaitingForInput(chatId) {
    return this.userInputState.has(chatId.toString());
  }

  // NEW: Handle user input for specific actions
  async handleUserInput(chatId, text) {
    const action = this.userInputState.get(chatId.toString());
    
    switch (action) {
      case 'add_premium':
        await userHandler.addPremiumUser(chatId, text);
        break;
      case 'add_user':
        await userHandler.addRegularUser(chatId, text);
        break;
      default:
        global.bot.sendMessage(chatId, "❌ Input tidak valid.");
    }
    
    // Clear input state
    this.userInputState.delete(chatId.toString());
    
    // Kembali ke menu utama setelah input
    setTimeout(() => {
      this.showMainMenu({ chat: { id: chatId } });
    }, 1000);
  }
}

module.exports = new BubbleHandler();