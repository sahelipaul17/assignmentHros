// dbConfig.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'your-mysql-host',
  user: 'your-mysql-user',
  password: 'your-mysql-password',
  database: 'your-database-name',
  connectionLimit: 10,
});
