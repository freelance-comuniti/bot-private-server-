const userHandler = require('./user-handler');
const dataHandler = require('./data-handler');
const linkHandler = require('./link-handler');

class BubbleHandler {
  
  // Show main menu dengan bubble buttons
  showMainMenu(msg) {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;
    
    const menuText = `🤖 **FREELANCE BOT PANEL**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nHalo ${userName}! 👋\nSelamat datang di panel admin.\n\n🔧 *Bot by RizzXploit • JCN Community*`;
    
    const menuOptions = {
      reply_markup: {
        keyboard: [
          [
            { text: "👥 USER MANAGEMENT" },
            { text: "📊 DATA MANAGEMENT" }
          ],
          [
            { text: "🔗 LINK SHARING" },
            { text: "🛠️ UTILITIES" }
          ],
          [
            { text: "📈 MY STATS" },
            { text: "ℹ️ HELP" }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      },
      parse_mode: 'Markdown'
    };
    
    global.bot.sendMessage(chatId, menuText, menuOptions);
  }

  // Handle text messages dari user
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

  // Handle callback queries (untuk inline buttons nanti)
  handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    console.log(`🔘 Callback query: ${data} from ${chatId}`);
    
    global.bot.answerCallbackQuery(query.id, {
      text: "Fitur dalam pengembangan..."
    });
  }

  // USER MANAGEMENT MENU
  showUserManagementMenu(chatId) {
    const menuText = `👥 **USER MANAGEMENT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nKelola pengguna dan akses premium.\n\n🔧 *Bot by RizzXploit • JCN Community*`;
    
    const menuOptions = {
      reply_markup: {
        keyboard: [
          [
            { text: "➕ ADD PREM" },
            { text: "➕ ADD USER" }
          ],
          [
            { text: "📋 LIST USER" },
            { text: "👑 PREMIUM LIST" }
          ],
          [
            { text: "🔙 BACK TO MAIN" }
          ]
        ],
        resize_keyboard: true
      },
      parse_mode: 'Markdown'
    };
    
    global.bot.sendMessage(chatId, menuText, menuOptions);
  }

  // DATA MANAGEMENT MENU
  showDataManagementMenu(chatId) {
    const menuText = `📊 **DATA MANAGEMENT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nKelola data dan laporan yang terkumpul.\n\n🔧 *Bot by RizzXploit • JCN Community*`;
    
    const menuOptions = {
      reply_markup: {
        keyboard: [
          [
            { text: "👀 VIEW DATA" },
            { text: "💎 VIEW PREMIUM" }
          ],
          [
            { text: "🗑️ DELETE DATA" },
            { text: "📈 MY STATS" }
          ],
          [
            { text: "🔙 BACK TO MAIN" }
          ]
        ],
        resize_keyboard: true
      },
      parse_mode: 'Markdown'
    };
    
    global.bot.sendMessage(chatId, menuText, menuOptions);
  }

  // LINK SHARING MENU
  showLinkSharingMenu(chatId) {
    const menuText = `🔗 **LINK SHARING**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nBagikan link untuk mengumpulkan data.\n\n🔧 *Bot by RizzXploit • JCN Community*`;
    
    const menuOptions = {
      reply_markup: {
        keyboard: [
          [
            { text: "🌐 BAGIKAN LINK" },
            { text: "💎 LINK VVIP" }
          ],
          [
            { text: "📨 UNDANG USER" },
            { text: "🔄 REFRESH" }
          ],
          [
            { text: "🔙 BACK TO MAIN" }
          ]
        ],
        resize_keyboard: true
      },
      parse_mode: 'Markdown'
    };
    
    global.bot.sendMessage(chatId, menuText, menuOptions);
  }

  // UTILITIES MENU
  showUtilitiesMenu(chatId) {
    const menuText = `🛠️ **UTILITIES**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nFitur tambahan dan pengaturan.\n\n🔧 *Bot by RizzXploit • JCN Community*`;
    
    const menuOptions = {
      reply_markup: {
        keyboard: [
          [
            { text: "ℹ️ HELP" },
            { text: "⚙️ SETTINGS" }
          ],
          [
            { text: "📞 SUPPORT" },
            { text: "🔐 LOGOUT" }
          ],
          [
            { text: "🔙 BACK TO MAIN" }
          ]
        ],
        resize_keyboard: true
      },
      parse_mode: 'Markdown'
    };
    
    global.bot.sendMessage(chatId, menuText, menuOptions);
  }

  // HELP MENU
  showHelpMenu(chatId) {
    const helpText = `ℹ️ **BOT HELP & GUIDE**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👥 **USER MANAGEMENT**\n` +
      `• Add Prem - Tambah user premium\n` +
      `• Add User - Tambah user member\n` +
      `• List User - Lihat semua user\n\n` +
      
      `📊 **DATA MANAGEMENT**\n` +
      `• View Data - Lihat data pribadi\n` +
      `• View Premium - Download full report\n` +
      `• Delete Data - Hapus data tertentu\n\n` +
      
      `🔗 **LINK SHARING**\n` +
      `• Bagikan Link - Link member\n` +
      `• Link VVIP - Link premium\n` +
      `• Undang User - Invite system\n\n` +
      
      `🔧 *Bot by RizzXploit • JCN Community*`;
    
    global.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
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
