import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const signup = async (req, res) => {
    const { name, email, password, role = 'student' } = req.body;

    try {
        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT email FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        // FIXED: Replaced 'user.email' with just 'email' since 'user' doesn't exist yet!
        const token = jwt.sign(
            { userId: result.insertId, email: email, role: role, mess_id: null },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    user_id: result.insertId,
                    name,
                    email,
                    role,
                    mess_id: null
                }
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query(
            `SELECT u.user_id, u.name, u.email, u.password, u.role, u.status, u.mess_id, m.name as mess_name 
             FROM users u 
             LEFT JOIN messes m ON u.mess_id = m.mess_id 
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.role.toLowerCase() === 'owner' && user.status === 'pending') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account pending approval. Please contact the administrator.' 
            });
        }
        
        if (user.role.toLowerCase() === 'owner' && user.status === 'rejected') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account application rejected.' 
            });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role, mess_id: user.mess_id, mess_name: user.mess_name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    mess_id: user.mess_id,
                    mess_name: user.mess_name // <--- THIS WAS THE MISSING PIECE!
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// ==========================================
// GET USER PROFILE & GAMIFICATION STATS
// ==========================================
export const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, name, email, role, points, created_at FROM users WHERE user_id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        const points = user.points || 0;

        let badge = "Newbie";
        let nextBadge = "Food Critic";
        let pointsNeeded = 50;
        let progress = (points / 50) * 100;

        if (points >= 150) {
            badge = "🏆 Top Foodie";
            nextBadge = "Max Level Achieved!";
            pointsNeeded = 0;
            progress = 100;
        } else if (points >= 50) {
            badge = "⭐ Food Critic";
            nextBadge = "Top Foodie";
            pointsNeeded = 150 - points;
            progress = ((points - 50) / 100) * 100;
        } else {
            badge = "🌱 Newbie";
            pointsNeeded = 50 - points;
        }

        res.json({
            success: true,
            data: {
                ...user,
                gamification: {
                    badge,
                    nextBadge,
                    pointsNeeded,
                    progressPercentage: Math.round(progress)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const { name } = req.body;

    try {
        await db.query(
            'UPDATE users SET name = ? WHERE user_id = ?',
            [name, req.user.userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// ==========================================
// ADMIN DASHBOARD - FETCH PENDING OWNERS
// ==========================================
export const getPendingOwners = async (req, res) => {
    try {
        const [owners] = await db.query(
            'SELECT user_id, name, email, created_at FROM users WHERE LOWER(role) = "owner" AND status = "pending" ORDER BY created_at ASC'
        );
        res.json({ success: true, data: owners });
    } catch (error) {
        console.error("Error fetching pending owners:", error);
        res.status(500).json({ success: false, message: "Server error fetching pending accounts." });
    }
};

// ==========================================
// ADMIN DASHBOARD - APPROVE/REJECT OWNER
// ==========================================
export const updateOwnerStatus = async (req, res) => {
    const { targetUserId, newStatus, messId } = req.body; 

    if (!['approved', 'rejected'].includes(newStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status update" });
    }

    try {
        if (newStatus === 'approved') {
            if (!messId) return res.status(400).json({ success: false, message: "A Mess ID is required for approval." });
            
            await db.query(
                'UPDATE users SET status = ?, mess_id = ? WHERE user_id = ? AND LOWER(role) = "owner"', 
                [newStatus, messId, targetUserId]
            );
        } else {
            await db.query(
                'UPDATE users SET status = ? WHERE user_id = ? AND LOWER(role) = "owner"', 
                [newStatus, targetUserId]
            );
        }
        
        res.json({ success: true, message: `Owner account ${newStatus} successfully.` });
    } catch (error) {
        console.error("Error updating owner status:", error);
        res.status(500).json({ success: false, message: "Server error updating account status." });
    }
};

// ==========================================
// ADMIN DASHBOARD - FETCH ACTIVE ASSIGNMENTS
// ==========================================
export const getActiveOwners = async (req, res) => {
    try {
        const [owners] = await db.query(
            `SELECT u.user_id, u.name as owner_name, u.email, m.name as mess_name 
             FROM users u 
             JOIN messes m ON u.mess_id = m.mess_id 
             WHERE LOWER(u.role) = 'owner' AND u.status = 'approved'
             ORDER BY m.name ASC`
        );
        res.json({ success: true, data: owners });
    } catch (error) {
        console.error("Error fetching active owners:", error);
        res.status(500).json({ success: false, message: "Server error fetching active assignments." });
    }
};