const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Log = sequelize.define('Log', {
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  updatedAt: false
});

Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Log;
