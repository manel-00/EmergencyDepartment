import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Card, 
    CardContent, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    SelectChangeEvent,
    CircularProgress
} from '@mui/material';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import statisticsService, { 
    DailyStats, 
    MonthlyStats, 
    YearlyStats, 
    OverallStats 
} from '../../services/statisticsService';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ConsultationStatsProps {
    doctorId?: string;
}

const ConsultationStats: React.FC<ConsultationStatsProps> = ({ doctorId }) => {
    const [timeFrame, setTimeFrame] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
    const [yearlyStats, setYearlyStats] = useState<YearlyStats[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startDate, setStartDate] = useState<string>(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    // Function to fetch statistics based on the selected time frame
    const fetchStats = async () => {
        setLoading(true);
        try {
            if (doctorId) {
                // Fetch doctor-specific stats
                if (timeFrame === 'daily') {
                    const data = await statisticsService.getDailyStatsByDoctor(doctorId, startDate, endDate);
                    setDailyStats(data);
                } else if (timeFrame === 'monthly') {
                    const data = await statisticsService.getMonthlyStatsByDoctor(doctorId, year);
                    setMonthlyStats(data);
                } else if (timeFrame === 'yearly') {
                    const data = await statisticsService.getYearlyStatsByDoctor(doctorId);
                    setYearlyStats(data);
                }
            } else {
                // Fetch overall stats for all doctors
                const data = await statisticsService.getOverallStats();
                setOverallStats(data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats when component mounts or when time frame changes
    useEffect(() => {
        fetchStats();
    }, [doctorId, timeFrame, year, startDate, endDate]);

    // Handle time frame change
    const handleTimeFrameChange = (event: SelectChangeEvent) => {
        setTimeFrame(event.target.value as 'daily' | 'monthly' | 'yearly');
    };

    // Handle year change for monthly stats
    const handleYearChange = (event: SelectChangeEvent) => {
        setYear(Number(event.target.value));
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Format month name
    const getMonthName = (monthNumber: number) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    // Render loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    // Render doctor-specific stats
    if (doctorId) {
        return (
            <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>
                                Teleconsultation Statistics
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Time Frame</InputLabel>
                                <Select
                                    value={timeFrame}
                                    label="Time Frame"
                                    onChange={handleTimeFrameChange}
                                >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                    <MenuItem value="yearly">Yearly</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {timeFrame === 'daily' && (
                        <>
                            <Box sx={{ mt: 3, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Start Date</InputLabel>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                style={{ 
                                                    padding: '14px', 
                                                    border: '1px solid #ccc', 
                                                    borderRadius: '4px',
                                                    width: '100%'
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>End Date</InputLabel>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                style={{ 
                                                    padding: '14px', 
                                                    border: '1px solid #ccc', 
                                                    borderRadius: '4px',
                                                    width: '100%'
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Daily Teleconsultation Statistics
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={dailyStats}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={formatDate}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={70}
                                                />
                                                <YAxis />
                                                <Tooltip 
                                                    formatter={(value) => [`${value}`, '']}
                                                    labelFormatter={(label) => formatDate(label)}
                                                />
                                                <Legend />
                                                <Bar dataKey="count" name="Total Consultations" fill="#8884d8" />
                                                <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                                                <Bar dataKey="cancelled" name="Cancelled" fill="#ff8042" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Daily Revenue
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={dailyStats}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={formatDate}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value) => [`$${value}`, '']}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </>
                    )}

                    {timeFrame === 'monthly' && (
                        <>
                            <Box sx={{ mt: 3, mb: 2 }}>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Year</InputLabel>
                                    <Select
                                        value={year.toString()}
                                        label="Year"
                                        onChange={handleYearChange}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Teleconsultation Statistics for {year}
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={monthlyStats}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="month" 
                                                    tickFormatter={(month) => getMonthName(month)}
                                                />
                                                <YAxis />
                                                <Tooltip 
                                                    formatter={(value) => [`${value}`, '']}
                                                    labelFormatter={(label) => getMonthName(Number(label))}
                                                />
                                                <Legend />
                                                <Bar dataKey="count" name="Total Consultations" fill="#8884d8" />
                                                <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                                                <Bar dataKey="cancelled" name="Cancelled" fill="#ff8042" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Revenue for {year}
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={monthlyStats}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month" 
                                            tickFormatter={(month) => getMonthName(month)}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value) => [`$${value}`, '']}
                                            labelFormatter={(label) => getMonthName(Number(label))}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </>
                    )}

                    {timeFrame === 'yearly' && (
                        <>
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Yearly Teleconsultation Statistics
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={yearlyStats}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="year" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" name="Total Consultations" fill="#8884d8" />
                                                <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                                                <Bar dataKey="cancelled" name="Cancelled" fill="#ff8042" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Yearly Revenue
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={yearlyStats}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </>
                    )}
                </Paper>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Consultations
                                </Typography>
                                <Typography variant="h4">
                                    {timeFrame === 'daily' 
                                        ? dailyStats.reduce((sum, stat) => sum + stat.count, 0)
                                        : timeFrame === 'monthly'
                                            ? monthlyStats.reduce((sum, stat) => sum + stat.count, 0)
                                            : yearlyStats.reduce((sum, stat) => sum + stat.count, 0)
                                    }
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Revenue
                                </Typography>
                                <Typography variant="h4">
                                    ${timeFrame === 'daily' 
                                        ? dailyStats.reduce((sum, stat) => sum + stat.totalRevenue, 0).toFixed(2)
                                        : timeFrame === 'monthly'
                                            ? monthlyStats.reduce((sum, stat) => sum + stat.totalRevenue, 0).toFixed(2)
                                            : yearlyStats.reduce((sum, stat) => sum + stat.totalRevenue, 0).toFixed(2)
                                    }
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Average Duration
                                </Typography>
                                <Typography variant="h4">
                                    {timeFrame === 'daily' 
                                        ? (dailyStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / (dailyStats.length || 1)).toFixed(0)
                                        : timeFrame === 'monthly'
                                            ? (monthlyStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / (monthlyStats.length || 1)).toFixed(0)
                                            : (yearlyStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / (yearlyStats.length || 1)).toFixed(0)
                                    } min
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Render overall stats for all doctors
    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Overall Teleconsultation Statistics
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Consultations by Doctor
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={overallStats}
                                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis 
                                    dataKey="doctorName" 
                                    type="category" 
                                    width={150}
                                />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" name="Total Consultations" fill="#8884d8" />
                                <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                                <Bar dataKey="cancelled" name="Cancelled" fill="#ff8042" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Revenue by Doctor
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={overallStats}
                                    dataKey="totalRevenue"
                                    nameKey="doctorName"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    fill="#8884d8"
                                    label={(entry) => `${entry.doctorName}: $${entry.totalRevenue}`}
                                >
                                    {overallStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Consultations
                            </Typography>
                            <Typography variant="h4">
                                {overallStats.reduce((sum, stat) => sum + stat.count, 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Revenue
                            </Typography>
                            <Typography variant="h4">
                                ${overallStats.reduce((sum, stat) => sum + stat.totalRevenue, 0).toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Average Duration
                            </Typography>
                            <Typography variant="h4">
                                {(overallStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / (overallStats.length || 1)).toFixed(0)} min
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ConsultationStats;
