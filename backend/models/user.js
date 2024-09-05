const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: uuidv4
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'user',
  underscored: true,
  timestamps: false
});

module.exports = User;
