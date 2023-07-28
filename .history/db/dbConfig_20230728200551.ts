// dbConfig.ts
import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = new Sequelize('your-database-name', 'your-database-user', 'your-database-password', {
  host: 'your-database-host',
  dialect: 'mysql',
});

class User extends Model {
    password(password: any, password1: any) {
        throw new Error('Method not implemented.');
    }
    role: string;
    id: any;
}
class Feed extends Model {}

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
  { sequelize, modelName: 'user' }
);

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
  { sequelize, modelName: 'feed' }
);

export { sequelize, User, Feed };
