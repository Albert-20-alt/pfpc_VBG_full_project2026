const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactInfo = sequelize.define('ContactInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Ziguinchor, Sénégal'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'contact@fbariss.sn'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '+221 33 991 00 00'
    }
}, {
    timestamps: true
});

module.exports = ContactInfo;
