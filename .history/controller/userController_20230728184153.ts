// userController.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const saltRounds = 10; // Number of salt rounds for bcrypt password hashing

// Define a user type for better type checking
interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  password: string;
}

// Mock database of users (replace with actual database)
let users: User[] = [
  {
    id: 1,
    name: 'Super Admin',
    role: 'Super Admin',
    email: 'superadmin@example.com',
    password: '$2b$10$5mG2r7MnWOr/AGInW4kY/ujQIDxH.S/U8EC5m62KdnIR4g7Id9bM.', // Password: secret
  },
];
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

    const token = jwt.sign({ id: user.id, role: user.role }, '975f056b4552226360a6f808c1a1ff57e4ee07d9347479e8afd1d9ed8147eebf6b9717c262727b286555e2a3b427d33bb88766d150956c7778e06f28a08f5e1c573e6d15831c6108c6567822ae353355ce7b00a8c5547d6d7340a8cf9643f20a3d3affa8f3100d1e9c600e1257a1f7ccd41d9e064efaca490c955e708fb901e3bff58839b251b6d684acd0d788419cc74cface45ba58cca6a360ed87ff447bd0c49204cfaad3f64e3b4845decd05cd51c5ef093498e8425bb978d6530e13067d43114b4d0561a9cd73c654f5123a35df747b19a64a5bc30efa59091cb94fbcd58d4dac4cec261763f2a3c59e71c72d9e74366b2ad0e52a97c56083aa0a41cbfe');
    return res.json({ token });
  });
};
// GET all users
export const getAllUsers = (req: Request, res: Response) => {
  res.json(users);
};

// GET single user by ID
export const getUserById = (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
};

// CREATE a new user
export const createUser = (req: Request, res: Response) => {
  const { name, email, role, password } = req.body;

  // Check if the email is already in use
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ message: 'Email is already in use' });
  }

  // Generate a unique ID (in a real application, use a proper ID generator)
  const newUserId = users.length + 1;

  // Hash the password with bcrypt before saving it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const newUser: User = {
      id: newUserId,
      name,
      email,
      role,
      password: hashedPassword,
    };

    // Save the new user to the database
    users.push(newUser);

    res.status(201).json(newUser);
  });
};

// UPDATE user
export const updateUser = (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { name, email, role } = req.body;

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updatedUser = { ...users[userIndex], name, email, role };
  users[userIndex] = updatedUser;

  res.json(updatedUser);
};

// DELETE user
export const deleteUser = (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  // Filter out the user with the given ID
  users = users.filter((u) => u.id !== userId);

  res.json({ message: 'User deleted successfully' });
};