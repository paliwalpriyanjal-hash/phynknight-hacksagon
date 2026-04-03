const emergencyService = require('../services/emergencyService');

exports.createEmergency = async (req, res) => {
    try {
        const emergency = await emergencyService.createEmergency(req.user.id, req.body);
        res.status(201).json(emergency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyEmergencies = async (req, res) => {
    try {
        const emergencies = await emergencyService.getUserEmergencies(req.user.id);
        res.status(200).json(emergencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllEmergencies = async (req, res) => {
    try {
        const emergencies = await emergencyService.getAllEmergencies();
        res.status(200).json(emergencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const emergency = await emergencyService.updateStatus(id, status);
        res.status(200).json(emergency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.assignDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const emergency = await emergencyService.assignDoctor(id);
        res.status(200).json(emergency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
