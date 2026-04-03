const Emergency = require('../models/Emergency');
const doctorService = require('./doctorService');

exports.createEmergency = async (userId, data) => {
    const aiConfidence = Math.floor(Math.random() * (99 - 85 + 1)) + 85; 
    
    // AI risk evaluation mock
    let riskLevel = 'LOW';
    if (data.symptoms.includes('chest pain') || data.symptoms.includes('breathing difficulty')) {
        riskLevel = 'HIGH';
    } else if (data.symptoms.includes('bleeding') || data.symptoms.includes('fracture')) {
        riskLevel = 'MEDIUM';
    }

    const emergency = new Emergency({
        ...data,
        userId,
        riskLevel,
        aiConfidence
    });

    await emergency.save();
    return emergency;
};

exports.getUserEmergencies = async (userId) => {
    return Emergency.find({ userId }).populate('assignedDoctorId').sort({ createdAt: -1 });
};

exports.getAllEmergencies = async () => {
    return Emergency.find({}).populate('userId', 'name').populate('assignedDoctorId').sort({ createdAt: -1 });
};

exports.updateStatus = async (emergencyId, newStatus) => {
    const allowedTransitions = {
        'Pending': ['Acknowledged'],
        'Acknowledged': ['Preparing'],
        'Preparing': ['Completed']
    };

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) throw new Error('Emergency not found');

    if (!allowedTransitions[emergency.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${emergency.status} to ${newStatus}`);
    }

    emergency.status = newStatus;
    await emergency.save();
    return emergency;
};

exports.assignDoctor = async (emergencyId) => {
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) throw new Error('Emergency not found');
    
    if (emergency.riskLevel !== 'MEDIUM') {
        throw new Error('Auto doctor assignment is primarily for MEDIUM risk');
    }

    const availableDoctor = await doctorService.getAvailableDoctor();
    if (!availableDoctor) throw new Error('No doctors available. Please assign later.');

    emergency.assignedDoctorId = availableDoctor._id;
    emergency.status = 'Preparing'; 
    await emergency.save();

    await doctorService.markDoctorUnavailable(availableDoctor._id);

    return emergency;
};
