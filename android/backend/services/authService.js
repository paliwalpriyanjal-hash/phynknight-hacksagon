const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (email, password, role) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.role !== role) {
        throw new Error(`Invalid role. User is not a ${role}`);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
    );

    return { user: { id: user._id, email: user.email, role: user.role, name: user.name }, token };
};

exports.registerUser = async (data) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const newUser = new User({ ...data, password: hashedPassword });
    await newUser.save();
    return newUser;
};
