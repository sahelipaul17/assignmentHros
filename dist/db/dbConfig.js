"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feed = exports.User = exports.sequelize = void 0;
// dbConfig.ts
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('userFeed', 'root', 'Saheli@123', {
    host: 'localhost',
    dialect: 'mysql',
});
exports.sequelize = sequelize;
class User extends sequelize_1.Model {
    static password(password, password1) {
        throw new Error('Method not implemented.');
    }
    password(password, password1) {
        throw new Error('Method not implemented.');
    }
}
exports.User = User;
class Feed extends sequelize_1.Model {
}
exports.Feed = Feed;
User.init({
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize, modelName: 'user' });
Feed.init({
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
}, { sequelize, modelName: 'feed' });
