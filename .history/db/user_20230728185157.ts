// user.ts
import { pool } from './dbConfig';

export interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  password: string;
}

export async function createUser(user: User): Promise<User> {
  const connection = await pool.getConnection();

  try {
    const query = 'INSERT INTO User (name, role, email, password) VALUES (?, ?, ?, ?)';
    const values = [user.name, user.role, user.email, user.password];
    const [result] = await connection.query(query, values);
    const insertedUserId = result.insertId;
    return { ...user, id: insertedUserId };
  } finally {
    connection.release();
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query<User[]>('SELECT * FROM User WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

// Add other user-related operations as needed (e.g., getUserByEmail, updateUser, deleteUser, etc.)
