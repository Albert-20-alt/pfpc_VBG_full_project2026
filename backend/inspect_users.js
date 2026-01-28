const sequelize = require('./config/database');
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
