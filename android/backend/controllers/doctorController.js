const doctorService = require('../services/doctorService');

exports.getAvailableDoctors = async (req, res) => {
    try {
        const doctors = await doctorService.getAllDoctors();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
