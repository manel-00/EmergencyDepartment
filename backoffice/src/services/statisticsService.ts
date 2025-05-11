import axios from 'axios';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        }
    };
};

// Define types for statistics data
export interface DailyStats {
    date: string;
    count: number;
    completed: number;
    cancelled: number;
    totalDuration: number;
    totalRevenue: number;
    averageDuration: number;
}

export interface MonthlyStats {
    year: number;
    month: number;
    date: string;
    count: number;
    completed: number;
    cancelled: number;
    totalDuration: number;
    totalRevenue: number;
    averageDuration: number;
}

export interface YearlyStats {
    year: number;
    count: number;
    completed: number;
    cancelled: number;
    totalDuration: number;
    totalRevenue: number;
    averageDuration: number;
}

export interface OverallStats {
    doctorId: string;
    doctorName: string;
    count: number;
    completed: number;
    cancelled: number;
    totalDuration: number;
    totalRevenue: number;
    averageDuration: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const statisticsService = {
    // Get daily statistics for a doctor
    getDailyStatsByDoctor: async (doctorId: string, startDate?: string, endDate?: string): Promise<DailyStats[]> => {
        let url = `${API_URL}/api/statistics/doctor/${doctorId}/daily`;

        // Add query parameters if provided
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    },

    // Get monthly statistics for a doctor
    getMonthlyStatsByDoctor: async (doctorId: string, year?: number): Promise<MonthlyStats[]> => {
        let url = `${API_URL}/api/statistics/doctor/${doctorId}/monthly`;

        // Add year parameter if provided
        if (year) {
            url += `?year=${year}`;
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    },

    // Get yearly statistics for a doctor
    getYearlyStatsByDoctor: async (doctorId: string): Promise<YearlyStats[]> => {
        const response = await axios.get(`${API_URL}/api/statistics/doctor/${doctorId}/yearly`, getAuthHeaders());
        return response.data;
    },

    // Get overall statistics for all doctors
    getOverallStats: async (): Promise<OverallStats[]> => {
        const response = await axios.get(`${API_URL}/api/statistics/overall`, getAuthHeaders());
        return response.data;
    }
};

export default statisticsService;
