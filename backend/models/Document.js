const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Case = require('./Case');

const Document = sequelize.define('Document', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: { // Added type field to support document types (PDF, Image, etc.)
    type: DataTypes.STRING,
    allowNull: true
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  updatedAt: false
});

Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
// Relationship with Case will be defined in Case.js or here after Case is defined to avoid circular dependency issues if not careful, 
// strictly speaking it works if Case is required, but let's be careful.
// Ideally, associations should be initialized in a separate file or after all models are loaded.
// For simplicity in this direct migration, I will use a deferred association or define it here if Case is ready. 
// Since Case.js is not migrated yet, I will comment this out and fix it when migrating Case.js or use a flexible approach.
// Actually, Sequelize handles this if we use lazy loading or define associations after model definitions.
// Let's define the foreign key explicitly without importing Case immediately to avoid circular req if Case imports Document.
// But Case doesn't import Document in original code.
// Document imports Case.
// So:
Document.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

module.exports = Document;
