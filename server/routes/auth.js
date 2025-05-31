const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
module.exports = router;

const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(409).json({ message: 'Email already in use.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
