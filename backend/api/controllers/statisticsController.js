const Consultation = require('../../models/Consultation');
const mongoose = require('mongoose');

// Get daily teleconsultation statistics for a specific doctor
exports.getDailyStatsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { startDate, endDate } = req.query;

        // Validate doctorId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'ID médecin invalide' });
        }

        // Create date filters
        const dateFilter = {};
        if (startDate) {
            dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.$lte = new Date(endDate);
        }

        // Build the match condition
        const matchCondition = {
            medecin: new mongoose.Types.ObjectId(doctorId)
        };

        if (Object.keys(dateFilter).length > 0) {
            matchCondition.date = dateFilter;
        }

        // Aggregate consultations by day
        const dailyStats = await Consultation.aggregate([
            {
                $match: matchCondition
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" }
                    },
                    count: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "terminé"] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "annulé"] }, 1, 0]
                        }
                    },
                    totalDuration: { $sum: "$duree" },
                    totalRevenue: { $sum: "$prix" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    count: 1,
                    completed: 1,
                    cancelled: 1,
                    totalDuration: 1,
                    totalRevenue: 1,
                    averageDuration: { $divide: ["$totalDuration", "$count"] }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json(dailyStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get monthly teleconsultation statistics for a specific doctor
exports.getMonthlyStatsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { year } = req.query;

        // Validate doctorId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'ID médecin invalide' });
        }

        // Build the match condition
        const matchCondition = {
            medecin: new mongoose.Types.ObjectId(doctorId)
        };

        // If year is provided, filter by that year
        if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year), 11, 31);
            matchCondition.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Aggregate consultations by month
        const monthlyStats = await Consultation.aggregate([
            {
                $match: matchCondition
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    count: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "terminé"] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "annulé"] }, 1, 0]
                        }
                    },
                    totalDuration: { $sum: "$duree" },
                    totalRevenue: { $sum: "$prix" }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: 1
                        }
                    },
                    count: 1,
                    completed: 1,
                    cancelled: 1,
                    totalDuration: 1,
                    totalRevenue: 1,
                    averageDuration: { $divide: ["$totalDuration", "$count"] }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json(monthlyStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get yearly teleconsultation statistics for a specific doctor
exports.getYearlyStatsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Validate doctorId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'ID médecin invalide' });
        }

        // Aggregate consultations by year
        const yearlyStats = await Consultation.aggregate([
            {
                $match: {
                    medecin: new mongoose.Types.ObjectId(doctorId)
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" }
                    },
                    count: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "terminé"] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "annulé"] }, 1, 0]
                        }
                    },
                    totalDuration: { $sum: "$duree" },
                    totalRevenue: { $sum: "$prix" }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    count: 1,
                    completed: 1,
                    cancelled: 1,
                    totalDuration: 1,
                    totalRevenue: 1,
                    averageDuration: { $divide: ["$totalDuration", "$count"] }
                }
            },
            {
                $sort: { year: 1 }
            }
        ]);

        res.json(yearlyStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get overall teleconsultation statistics for all doctors
exports.getOverallStats = async (req, res) => {
    try {
        // Aggregate consultations for all doctors
        const overallStats = await Consultation.aggregate([
            {
                $group: {
                    _id: "$medecin",
                    count: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "terminé"] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "annulé"] }, 1, 0]
                        }
                    },
                    totalDuration: { $sum: "$duree" },
                    totalRevenue: { $sum: "$prix" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "doctorInfo"
                }
            },
            {
                $unwind: "$doctorInfo"
            },
            {
                $project: {
                    _id: 0,
                    doctorId: "$_id",
                    doctorName: { $concat: ["$doctorInfo.name", " ", "$doctorInfo.lastname"] },
                    count: 1,
                    completed: 1,
                    cancelled: 1,
                    totalDuration: 1,
                    totalRevenue: 1,
                    averageDuration: { $divide: ["$totalDuration", "$count"] }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json(overallStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
