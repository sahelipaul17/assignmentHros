// dbConfig.ts
import { Sequelize, Model, DataTypes } from 'sequelize';

// Replace DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST with your database credentials
const sequelize = new Sequelize('DB_NAME', 'DB_USER', 'DB_PASSWORD', {
  host: 'DB_HOST',
  dialect: 'mysql',
});

class User extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'user',
  }
);

export { sequelize, User };
