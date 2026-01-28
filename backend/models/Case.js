const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Case = sequelize.define('Case', {
  // Victim Info
  victimName: DataTypes.STRING,
  victimAge: DataTypes.STRING,
  victimGender: DataTypes.STRING,
  victimDisability: DataTypes.STRING,
  victimMaritalStatus: DataTypes.STRING,
  victimReligion: DataTypes.STRING,
  victimEthnicity: DataTypes.STRING,
  victimEducation: DataTypes.STRING,
  victimProfession: DataTypes.STRING,
  victimRegion: DataTypes.STRING,
  victimCommune: DataTypes.STRING,

  // Perpetrator Info
  perpetratorName: DataTypes.STRING,
  perpetratorGender: DataTypes.STRING,
  perpetratorAge: DataTypes.STRING,
  perpetratorProfession: DataTypes.STRING,
  perpetratorRegion: DataTypes.STRING,
  perpetratorCommune: DataTypes.STRING,
  perpetratorSocialClass: DataTypes.STRING,
  relationshipToVictim: DataTypes.STRING,

  // Violence Info
  violenceType: DataTypes.STRING,
  violenceDescription: DataTypes.TEXT,
  incidentDate: DataTypes.STRING,
  incidentLocation: DataTypes.TEXT,

  // Support & Referral
  servicesProvided: {
    type: DataTypes.JSON, // Array of strings
    defaultValue: []
  },
  followUpRequired: DataTypes.STRING,
  supportNeeds: DataTypes.TEXT,
  referrals: DataTypes.TEXT,

  // System
  status: {
    type: DataTypes.ENUM('pending', 'open', 'closed', 'archived', 'completed', 'follow-up'),
    defaultValue: 'pending'
  },
  agentId: DataTypes.STRING,
  agentName: DataTypes.STRING,

  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Case;
