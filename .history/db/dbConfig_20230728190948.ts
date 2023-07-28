// dbConfig.ts
import { Sequelize } from 'sequelize';

// Replace DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST with your database credentials
const sequelize = new Sequelize('DB_NAME', 'DB_USER', 'DB_PASSWORD', {
  host: 'DB_HOST',
  dialect: 'mysql',
});

export default sequelize;