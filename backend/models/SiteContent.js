const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteContent = sequelize.define('SiteContent', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT('long'), // Use LONGTEXT for large content
        allowNull: false
    },
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'site_content',
    timestamps: true
});

module.exports = SiteContent;
