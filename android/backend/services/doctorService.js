const Doctor = require('../models/Doctor');

exports.getAvailableDoctor = async () => {
    const doctor = await Doctor.findOne({ isAvailable: true });
    return doctor;
};

exports.markDoctorUnavailable = async (doctorId) => {
    return await Doctor.findByIdAndUpdate(doctorId, { isAvailable: false }, { new: true });
};

exports.getAllDoctors = async () => {
    return Doctor.find({});
};
