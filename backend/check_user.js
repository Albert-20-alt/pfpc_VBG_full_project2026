const User = require('./models/User');
const sequelize = require('./config/database');
require('dotenv').config();

async function checkUser() {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email: 'admin@ebenimmo.sn' } });
        if (user) {
            console.log('User found:', user.toJSON());
            console.log('Region:', user.region);
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
checkUser();
