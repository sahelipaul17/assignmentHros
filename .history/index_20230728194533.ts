// Import necessary packages and models

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, Feed } from './db/dbConfig';
import {authMiddleware} from './middleware/authMiddleware';

const app = express();
app.use(express.json());

// Middleware for role-based access control
const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Routes for user authentication and managing users
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Super Admin can create other users
app.post('/users', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
    const { name, role, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with the same email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newUser = await User.create({ name, role, email, password: hashedPassword });
      return res.json(newUser);
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
});

// Super Admin can update and delete other users
app.put('/users/:id', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
  const { name, role } = req.body;

  try {
    const updatedUser = await User.update({ name, role }, {
      where: { id: userId },
    });
    if (updatedUser[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/users/:id', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
  // Implementation to delete users
});

// Super Admin can create, update, and delete feeds
app.post('/feeds', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
  // Implementation to create new feeds
});

app.put('/feeds/:id', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
  // Implementation to update feeds
});

app.delete('/feeds/:id', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
  // Implementation to delete feeds
});

// Admin can create Basic users and provide access to feeds
app.post('/users/basic', authMiddleware, roleMiddleware(['Admin']), async (req: Request, res: Response) => {
  // Implementation to create Basic users
});

app.post('/users/:id/access', authMiddleware, roleMiddleware(['Admin']), async (req: Request, res: Response) => {
  // Implementation to provide access to feeds for Basic users
});

// Basic users can read feeds they have access to
app.get('/feeds', authMiddleware, roleMiddleware(['Basic']), async (req: Request, res: Response) => {
  // Implementation to get feeds accessible by Basic users
});

// Super Admin can access logs
app.get('/logs', authMiddleware, roleMiddleware(['Super Admin']), async (req: Request, res: Response) => {
  // Implementation to get logs (Read logs from files)
});

// Set up the server to listen on a specific port
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
