const db = require('./db');

class UserModel {
  async findOne(condition) {
    const { user_id, role, is_active } = condition;
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active);
    }

    sql += ' LIMIT 1';
    const users = await db.query(sql, params);
    return users[0] || null;
  }

  async create(userData) {
    const { user_id, username, first_name, role, invited_by } = userData;
    const sql = `
      INSERT INTO users (user_id, username, first_name, role, invited_by) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [user_id, username, first_name, role, invited_by]);
    return this.findOne({ user_id });
  }

  async update(userId, updateData) {
    const fields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
    params.push(userId);

    await db.query(sql, params);
    return this.findOne({ user_id: userId });
  }

  async findAll(condition = {}) {
    const { role, is_active } = condition;
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active);
    }

    sql += ' ORDER BY join_date DESC';
    return await db.query(sql, params);
  }

  async count(condition = {}) {
    const { role, is_active } = condition;
    let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active);
    }

    const result = await db.query(sql, params);
    return result[0].count;
  }
}

class DataModel {
  async create(data) {
    const { file_id, user_id, image_url, ip_address, user_agent, device_type, country, referrer } = data;
    const sql = `
      INSERT INTO data (file_id, user_id, image_url, ip_address, user_agent, device_type, country, referrer) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [file_id, user_id, image_url, ip_address, user_agent, device_type, country, referrer]);
    return this.findOne({ file_id });
  }

  async findOne(condition) {
    const { file_id, user_id } = condition;
    let sql = 'SELECT * FROM data WHERE 1=1';
    const params = [];

    if (file_id) {
      sql += ' AND file_id = ?';
      params.push(file_id);
    }
    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    sql += ' LIMIT 1';
    const data = await db.query(sql, params);
    return data[0] || null;
  }

  async findByUserId(userId, limit = 10) {
    const sql = 'SELECT * FROM data WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?';
    return await db.query(sql, [userId, limit]);
  }

  async findAll(condition = {}) {
    const { user_id } = condition;
    let sql = 'SELECT * FROM data WHERE 1=1';
    const params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    sql += ' ORDER BY timestamp DESC';
    return await db.query(sql, params);
  }

  async count(condition = {}) {
    const { user_id } = condition;
    let sql = 'SELECT COUNT(*) as count FROM data WHERE 1=1';
    const params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    const result = await db.query(sql, params);
    return result[0].count;
  }

  async deleteOne(condition) {
    const { file_id, user_id } = condition;
    let sql = 'DELETE FROM data WHERE 1=1';
    const params = [];

    if (file_id) {
      sql += ' AND file_id = ?';
      params.push(file_id);
    }
    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    sql += ' LIMIT 1';
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }
}

class LinkModel {
  async create(linkData) {
    const { link_code, user_id, link_type, expires_at } = linkData;
    const sql = `
      INSERT INTO links (link_code, user_id, link_type, expires_at) 
      VALUES (?, ?, ?, ?)
    `;
    await db.query(sql, [link_code, user_id, link_type, expires_at]);
    return this.findOne({ link_code });
  }

  async findOne(condition) {
    const { link_code, user_id, is_active } = condition;
    let sql = 'SELECT * FROM links WHERE 1=1';
    const params = [];

    if (link_code) {
      sql += ' AND link_code = ?';
      params.push(link_code);
    }
    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active);
    }

    sql += ' LIMIT 1';
    const links = await db.query(sql, params);
    return links[0] || null;
  }

  async findByUserId(userId) {
    const sql = 'SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC';
    return await db.query(sql, [userId]);
  }

  async findAll(condition = {}) {
    const { link_type, is_active } = condition;
    let sql = 'SELECT * FROM links WHERE 1=1';
    const params = [];

    if (link_type) {
      sql += ' AND link_type = ?';
      params.push(link_type);
    }
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active);
    }

    return await db.query(sql, params);
  }

  async update(linkCode, updateData) {
    const fields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    const sql = `UPDATE links SET ${fields.join(', ')} WHERE link_code = ?`;
    params.push(linkCode);

    await db.query(sql, params);
    return this.findOne({ link_code: linkCode });
  }
}

module.exports = {
  User: new UserModel(),
  Data: new DataModel(),
  Link: new LinkModel()
};
