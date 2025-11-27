const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(process.env.DATABASE_URL);
      console.log('✅ MySQL connected successfully');
      
      await this.initTables();
      
    } catch (error) {
      console.error('❌ MySQL connection error:', error);
      process.exit(1);
    }
  }

  async initTables() {
    const usersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(100),
        first_name VARCHAR(100) NOT NULL,
        role ENUM('premium', 'member') DEFAULT 'member',
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invited_by VARCHAR(50) DEFAULT 'system',
        links_shared INT DEFAULT 0,
        data_collected INT DEFAULT 0,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;

    const dataTable = `
      CREATE TABLE IF NOT EXISTS data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        image_url TEXT NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        device_type ENUM('Desktop', 'Mobile', 'Tablet') DEFAULT 'Desktop',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        country VARCHAR(100) DEFAULT 'Unknown',
        referrer VARCHAR(500) DEFAULT 'Direct'
      )
    `;

    const linksTable = `
      CREATE TABLE IF NOT EXISTS links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        link_code VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        link_type ENUM('member', 'premium') DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        click_count INT DEFAULT 0,
        data_collected INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL
      )
    `;

    try {
      await this.connection.execute(usersTable);
      await this.connection.execute(dataTable);
      await this.connection.execute(linksTable);
      console.log('✅ MySQL tables initialized');
    } catch (error) {
      console.error('❌ Table creation error:', error);
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  }
}

module.exports = new Database();
