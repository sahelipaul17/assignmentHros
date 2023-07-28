"use strict";
// Import necessary packages and models
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = exports.addLog = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbConfig_1 = require("./db/dbConfig");
const authMiddleware_1 = require("./middleware/authMiddleware");
const saltRounds = 10;
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Middleware for role-based access control
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        var _a;
        if (!roles.includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
// Routes for user authentication and managing users
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield dbConfig_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user[password]);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, authMiddleware_1.secretKey, {
            expiresIn: "1h",
        });
        return res.json({ token });
    }
    catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// Super Admin can create other users
app.post("/users", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, role, email, password } = req.body;
    try {
        const existingUser = yield dbConfig_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with the same email already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const newUser = yield dbConfig_1.User.create({
            name,
            role,
            email,
            password: hashedPassword,
        });
        return res.json(newUser);
    }
    catch (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// Super Admin can update and delete other users
app.put("/users/:id", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id, 10);
    const { name, role } = req.body;
    try {
        const updatedUser = yield dbConfig_1.User.update({ name, role }, {
            where: { id: userId },
        });
        if (updatedUser[0] === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ message: "User updated successfully" });
    }
    catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.delete("/users/:id", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id, 10);
    try {
        const deletedUser = yield dbConfig_1.User.destroy({
            where: { id: userId },
        });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// Super Admin can create, update, and delete feeds
app.post("/feeds", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, url, description } = req.body;
    try {
        const newFeed = yield dbConfig_1.Feed.create({ name, url, description });
        return res.json(newFeed);
    }
    catch (err) {
        console.error("Error creating feed:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.put("/feeds/:id", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedId = parseInt(req.params.id, 10);
    const { name, url, description } = req.body;
    try {
        const updatedFeed = yield dbConfig_1.Feed.update({ name, url, description }, {
            where: { id: feedId },
        });
        if (updatedFeed[0] === 0) {
            return res.status(404).json({ message: "Feed not found" });
        }
        return res.json({ message: "Feed updated successfully" });
    }
    catch (err) {
        console.error("Error updating feed:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.delete("/feeds/:id", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedId = req.params.id;
    try {
        const feed = yield dbConfig_1.Feed.findByPk(feedId);
        if (!feed) {
            return res.status(404).json({ message: "Feed not found" });
        }
        yield feed.destroy();
        res.status(200).json({ message: "Feed deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting feed:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Admin can create Basic users and provide access to feeds
app.post("/users/basic", authMiddleware_1.authMiddleware, roleMiddleware(["Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, role, email, password } = req.body;
    try {
        // Verify if the requesting user is an Admin
        const requestingUser = yield dbConfig_1.User.findOne((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!requestingUser || requestingUser[role] !== "Admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        // Create a new Basic user
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const newUser = yield dbConfig_1.User.create({
            name,
            role,
            email,
            password: hashedPassword,
        });
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error("Error creating Basic user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/users/:id/access", authMiddleware_1.authMiddleware, roleMiddleware(["Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = req.params.id;
    const feedIds = req.body.feedIds;
    try {
        // Verify if the requesting user is an Admin
        const requestingUser = yield dbConfig_1.User.findOne((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!requestingUser || requestingUser.role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        // Verify if the target user is a Basic user
        const targetUser = yield dbConfig_1.User.findByPk(userId);
        if (!targetUser || targetUser.role !== "Basic") {
            return res
                .status(404)
                .json({ message: "User not found or not a Basic user" });
        }
        res.status(200).json({ message: "Access granted successfully" });
    }
    catch (err) {
        console.error("Error providing access to feeds:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
const logs = [];
const addLog = (log) => {
    logs.push(log);
};
exports.addLog = addLog;
const getLogs = () => {
    return logs;
};
exports.getLogs = getLogs;
app.get("/logs", authMiddleware_1.authMiddleware, roleMiddleware(["Super Admin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logs = (0, exports.getLogs)();
        res.status(200).json({ logs });
    }
    catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Set up the server to listen on a specific port
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
