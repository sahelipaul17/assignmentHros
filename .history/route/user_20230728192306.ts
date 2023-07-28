// user.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, sequelize } from '../db/user';

const secretKey = 'your-secret-key';

const userRouter = Router();

userRouter.post('/login', async (req: Request, res: Response) => {
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

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    return res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.post('/users', async (req: Request, res: Response) => {
  const { name, role, email, password } = req.body;

  try {
    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with the same email already exists' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const newUser = await User.create({ name, role, email, password: hashedPassword });
    return res.json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.put('/users/:id', async (req: Request, res: Response) => {
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

userRouter.delete('/users/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const deletedUser = await User.destroy({
      where: { id: userId },
    });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export { userRouter };
