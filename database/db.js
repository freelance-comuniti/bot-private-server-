const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.connection = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'freelance_bot',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createPool(this.config);
      
      // Test connection
      await this.connection.execute('SELECT 1');
      console.log('✅ MySQL connected successfully');
      
      // Initialize database tables
      await this.initTables();
      
      return this.connection;
    } catch (error) {
      console.error('❌ MySQL connection error:', error.message);
      throw error;
    }
  }

  async initTables() {
    try {
      // Users table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(50) UNIQUE NOT NULL,
          username VARCHAR(100),
          first_name VARCHAR(100) NOT NULL,
          role ENUM('premium', 'member') DEFAULT 'member',
          join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          invited_by VARCHAR(50) DEFAULT 'system',
          links_shared INT DEFAULT 0,
          data_collected INT DEFAULT 0,
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          INDEX idx_user_id (user_id),
          INDEX idx_role (role)
        )
      `);

      // Data table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          file_id VARCHAR(100) UNIQUE NOT NULL,
          user_id VARCHAR(50) NOT NULL,
          image_url TEXT NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          user_agent TEXT,
          device_type ENUM('Desktop', 'Mobile', 'Tablet') DEFAULT 'Desktop',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          country VARCHAR(100) DEFAULT 'Unknown',
          referrer VARCHAR(500),
          INDEX idx_user_id (user_id),
          INDEX idx_timestamp (timestamp)
        )
      `);

      // Links table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS links (
          id INT AUTO_INCREMENT PRIMARY KEY,
          link_code VARCHAR(50) UNIQUE NOT NULL,
          user_id VARCHAR(50) NOT NULL,
          link_type ENUM('member', 'premium') DEFAULT 'member',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          click_count INT DEFAULT 0,
          data_collected INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          expires_at DATETIME,
          INDEX idx_user_id (user_id),
          INDEX idx_link_code (link_code)
        )
      `);

      console.log('✅ Database tables initialized successfully');

      // Insert default admin user if not exists
      await this.connection.execute(`
        INSERT IGNORE INTO users (user_id, first_name, role, invited_by) 
        VALUES ('7418584938', 'Admin User', 'premium', 'system')
      `);

    } catch (error) {
      console.error('❌ Error initializing tables:', error.message);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('📴 MySQL connection closed');
    }
  }
}

module.exports = new Database();
