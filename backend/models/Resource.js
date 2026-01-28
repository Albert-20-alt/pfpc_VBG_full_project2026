const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Resource = sequelize.define('Resource', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  link: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'autre'
  },
  region: {
    type: DataTypes.STRING,
    defaultValue: 'National'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  updatedAt: false
});

Resource.belongsTo(User, { foreignKey: 'addedBy', as: 'uploader' });

module.exports = Resource;
