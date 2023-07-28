// app.ts

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
app.use(bodyParser.json());

const secretKey = 'your-secret-key'; // Replace with your own secret key for JWT

// Define a user type for better type checking
interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  password: string;
}

// Mock user data (replace with actual database queries)
const users: User[] = [
  {
    id: 1,
    name: 'Super Admin',
    role: 'Super Admin',
    email: 'superadmin@example.com',
    password: '$2b$10$5mG2r7MnWOr/AGInW4kY/ujQIDxH.S/U8EC5m62KdnIR4g7Id9bM.', // Password: secret
  },
];

// Middleware to verify JWT for authenticated routes
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { id: number; role: string };
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes setup
// Add routes for user authentication, user management, feed management, etc.

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
