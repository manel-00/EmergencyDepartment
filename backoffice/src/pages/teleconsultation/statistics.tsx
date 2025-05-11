import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Container, 
    Paper, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    SelectChangeEvent,
    CircularProgress
} from '@mui/material';
import ConsultationStats from '../../components/teleconsultation/ConsultationStats';
import axios from 'axios';

interface Doctor {
    _id: string;
    name: string;
    lastname: string;
}

const StatisticsPage: React.FC = () => {
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch doctors when component mounts
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Assuming there's an API endpoint to get all doctors
                const response = await axios.get('http://localhost:3000/user/doctors');
                setDoctors(response.data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Handle doctor selection change
    const handleDoctorChange = (event: SelectChangeEvent) => {
        setSelectedDoctor(event.target.value);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Teleconsultation Statistics
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Doctor</InputLabel>
                        <Select
                            value={selectedDoctor}
                            label="Select Doctor"
                            onChange={handleDoctorChange}
                        >
                            <MenuItem value="">All Doctors</MenuItem>
                            {doctors.map((doctor) => (
                                <MenuItem key={doctor._id} value={doctor._id}>
                                    {doctor.name} {doctor.lastname}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <ConsultationStats doctorId={selectedDoctor || undefined} />
                )}
            </Box>
        </Container>
    );
};

export default StatisticsPage;
