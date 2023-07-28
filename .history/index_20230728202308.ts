// Import necessary packages and models

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, Feed } from "./db/dbConfig";
import { authMiddleware, secretKey } from "./middleware/authMiddleware";

const saltRounds = 10;

const app = express();
app.use(express.json());

// Middleware for role-based access control
const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// Routes for user authentication and managing users
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[password]);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, {
      expiresIn: "1h",
    });
    return res.json({ token });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Super Admin can create other users
app.post(
  "/users",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    const { name, role, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with the same email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await User.create({
        name,
        role,
        email,
        password: hashedPassword,
      });
      return res.json(newUser);
    } catch (err) {
      console.error("Error creating user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Super Admin can update and delete other users
app.put(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const { name, role } = req.body;

    try {
      const updatedUser = await User.update(
        { name, role },
        {
          where: { id: userId },
        }
      );
      if (updatedUser[0] === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "User updated successfully" });
    } catch (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);

    try {
      const deletedUser = await User.destroy({
        where: { id: userId },
      });
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Super Admin can create, update, and delete feeds
app.post(
  "/feeds",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    const { name, url, description } = req.body;

    try {
      const newFeed = await Feed.create({ name, url, description });
      return res.json(newFeed);
    } catch (err) {
      console.error("Error creating feed:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.put(
  "/feeds/:id",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    const feedId = parseInt(req.params.id, 10);
    const { name, url, description } = req.body;

    try {
      const updatedFeed = await Feed.update(
        { name, url, description },
        {
          where: { id: feedId },
        }
      );
      if (updatedFeed[0] === 0) {
        return res.status(404).json({ message: "Feed not found" });
      }
      return res.json({ message: "Feed updated successfully" });
    } catch (err) {
      console.error("Error updating feed:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.delete(
  "/feeds/:id",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    const feedId = req.params.id;

    try {
      const feed = await Feed.findByPk(feedId);
      if (!feed) {
        return res.status(404).json({ message: "Feed not found" });
      }

      await feed.destroy();
      res.status(200).json({ message: "Feed deleted successfully" });
    } catch (err) {
      console.error("Error deleting feed:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Admin can create Basic users and provide access to feeds
app.post(
  "/users/basic",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req: Request, res: Response) => {
    const { name, role, email, password } = req.body;

    try {
      // Verify if the requesting user is an Admin
      const requestingUser = await User.findOne(req.user.id);
      if (!requestingUser || requestingUser[role] !== "Admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Create a new Basic user
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = await User.create({
        name,
        role,
        email,
        password: hashedPassword,
      });
      res.status(201).json(newUser);
    } catch (err) {
      console.error("Error creating Basic user:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post(
  "/users/:id/access",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const feedIds = req.body.feedIds;

    try {
      // Verify if the requesting user is an Admin
      const requestingUser = await User.findOne(req.user.id);
      if (!requestingUser || requestingUser.role !== "Admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Verify if the target user is a Basic user
      const targetUser = await User.findByPk(userId);
      if (!targetUser || targetUser.role !== "Basic") {
        return res
          .status(404)
          .json({ message: "User not found or not a Basic user" });
      }

      res.status(200).json({ message: "Access granted successfully" });
    } catch (err) {
      console.error("Error providing access to feeds:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get(
  "/feeds",
  authMiddleware,
  roleMiddleware(["Basic"]),
  async (req: Request, res: Response) => {
    try {
        // Get the authenticated Basic user from the request object
        const { user } = req;
    
        // Find the feeds accessible by the Basic user based on UserFeedAccess
        const accessibleFeeds = await Feed.findAll({
          include: [
            {
              where: { userId: user.id }, // Filter feeds associated with the Basic user
            },
          ],
        });
    
        res.status(200).json(accessibleFeeds);
      } catch (err) {
        console.error('Error fetching feeds:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
  }
);
const logs: string[] = [];

export const addLog = (log: string) => {
  logs.push(log);
};

export const getLogs = () => {
  return logs;
};
app.get(
  "/logs",
  authMiddleware,
  roleMiddleware(["Super Admin"]),
  async (req: Request, res: Response) => {
    try {
        const logs = getLogs();
      
      res.status(200).json({ logs });
    } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Set up the server to listen on a specific port
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
