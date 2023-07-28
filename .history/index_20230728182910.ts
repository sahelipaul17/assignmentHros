import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();
app.use(bodyParser.json());

const secretKey = 'your-secret-key'; // Replace with your own secret key for JWT

// Middleware to verify JWT for authenticated routes
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
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