// dbConfig.ts
import { Sequelize, Model, DataTypes } from 'sequelize';

// Replace DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST with your database credentials
const sequelize = new Sequelize('DB_NAME', 'DB_USER', 'DB_PASSWORD', {
  host: 'DB_HOST',
  dialect: 'mysql',
});

class Feed extends Model {}

Feed.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'feed',
  }
);

export { sequelize, Feed };
