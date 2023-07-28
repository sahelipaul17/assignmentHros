// userController.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const saltRounds = 10; // Number of salt rounds for bcrypt password hashing

// Mock user data (replace with actual database queries)
const superAdmin = {
  id: 1,
  name: 'Super Admin',
  role: 'Super Admin',
  email: 'superadmin@example.com',
  password: 'hashed_password_here',
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Mock user lookup (replace with actual database query)
  const user = superAdmin;

  if (!user || user.email !== email) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    return res.json({ token });
  });
};
const users: any[] = [superAdmin];

export const createUser = (req: Request, res: Response) => {
  // Implement logic to create a new user (only for super admin)
};

export const updateUser = (req: Request, res: Response) => {
  // Implement logic to update user information (only for super admin)
};

export const deleteUser = (req: Request, res: Response) => {
  // Implement logic to delete a user (only for super admin)
};