const authService = require('../services/authService');

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const result = await authService.login(email, password, role);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ message: 'User created successfully', user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
