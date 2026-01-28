const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('case_listening', 'legal_assistance', 'medical_assistance', 'social_support', 'awareness', 'coordination', 'training', 'other'),
        defaultValue: 'other'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'default'),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    relatedCaseId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignedTo: {
        type: DataTypes.INTEGER, // User ID (from User model which usually uses Integer auto-increment)
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER, // User ID
        allowNull: false
    },
    participants: {
        type: DataTypes.JSON, // Array of User IDs associated with the task
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'tasks',
    timestamps: true
});

module.exports = Task;
