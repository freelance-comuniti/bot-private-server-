const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: ''
  },
  first_name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['premium', 'member'],
    default: 'member'
  },
  join_date: {
    type: Date,
    default: Date.now
  },
  invited_by: {
    type: String,
    default: 'system'
  },
  links_shared: {
    type: Number,
    default: 0
  },
  data_collected: {
    type: Number,
    default: 0
  },
  last_active: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
});

// Data/Photo Schema
const dataSchema = new mongoose.Schema({
  file_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  ip_address: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    default: 'Unknown'
  },
  device_type: {
    type: String,
    enum: ['Desktop', 'Mobile', 'Tablet'],
    default: 'Desktop'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: 'Direct'
  }
});

// Link Schema
const linkSchema = new mongoose.Schema({
  link_code: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  link_type: {
    type: String,
    enum: ['member', 'premium'],
    default: 'member'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  click_count: {
    type: Number,
    default: 0
  },
  data_collected: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  expires_at: {
    type: Date
  }
});

// Invite Schema
const inviteSchema = new mongoose.Schema({
  invite_code: {
    type: String,
    required: true,
    unique: true
  },
  created_by: {
    type: String,
    required: true
  },
  used_by: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  used_at: {
    type: Date
  },
  is_used: {
    type: Boolean,
    default: false
  }
});

// Create models
const User = mongoose.model('User', userSchema);
const Data = mongoose.model('Data', dataSchema);
const Link = mongoose.model('Link', linkSchema);
const Invite = mongoose.model('Invite', inviteSchema);

module.exports = {
  User,
  Data,
  Link,
  Invite
};