const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Teacher = require('../models/Teacher');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new teacher
// @route   POST /api/auth/register
// @access  Public
const registerTeacher = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if teacher exists
    const teacherExists = await Teacher.findOne({ email });

    if (teacherExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create teacher
    const teacher = await Teacher.create({
        name,
        email,
        password,
    });

    if (teacher) {
        res.status(201).json({
            _id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            token: generateToken(teacher.id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a teacher
// @route   POST /api/auth/login
// @access  Public
const loginTeacher = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for teacher email
    const teacher = await Teacher.findOne({ email });

    if (teacher && (await teacher.matchPassword(password))) {
        res.json({
            _id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            token: generateToken(teacher.id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get teacher data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {
    registerTeacher,
    loginTeacher,
    getMe,
};
