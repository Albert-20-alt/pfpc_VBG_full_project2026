const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    // Event type
    action: {
        type: DataTypes.ENUM(
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'ACCOUNT_LOCKED',
            'CASE_VIEW',
            'CASE_CREATE',
            'CASE_UPDATE',
            'CASE_DELETE',
            'USER_CREATE',
            'USER_UPDATE',
            'USER_DELETE',
            'ROLE_CHANGE',
            'PASSWORD_CHANGE',
            'UNAUTHORIZED_ACCESS'
        ),
        allowNull: false
    },

    // Who performed the action
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true // Null for failed logins
    },
    userName: DataTypes.STRING,
    userRole: DataTypes.STRING,

    // Target resource
    resourceType: {
        type: DataTypes.STRING, // 'case', 'user', etc.
        allowNull: true
    },
    resourceId: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Request details
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.STRING,

    // Additional details (JSON for flexibility)
    details: {
        type: DataTypes.JSON,
        defaultValue: {}
    },

    // Status
    success: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // Timestamp
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    indexes: [
        { fields: ['userId'] },
        { fields: ['action'] },
        { fields: ['resourceType', 'resourceId'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = AuditLog;
