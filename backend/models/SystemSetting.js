const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        defaultValue: 'global_config'
    },
    // Branding
    logoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    faviconUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Security
    twoFactorAuth: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    passwordPolicyStrength: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    sessionTimeout: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    autoLockAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    // Notifications
    enableEmailNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    emailDigestFrequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'realtime'),
        defaultValue: 'daily'
    },
    // Maintenance
    dbBackupFrequency: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly'),
        defaultValue: 'daily'
    },
    auditLogRetention: {
        type: DataTypes.INTEGER,
        defaultValue: 90
    },
    maintenanceMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'system_settings',
    timestamps: true
});

module.exports = SystemSetting;
