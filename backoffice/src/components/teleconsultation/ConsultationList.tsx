import React, { useEffect, useState } from 'react';
import { Consultation } from '@/types/teleconsultation';
import { consultationService } from '@/services/teleconsultationService';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

const ConsultationList: React.FC = () => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConsultations();
    }, []);

    const loadConsultations = async () => {
        try {
            const data = await consultationService.getAll();
            setConsultations(data);
        } catch (error) {
            console.error('Erreur lors du chargement des consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: Consultation['status']) => {
        switch (status) {
            case 'planifié':
                return 'primary';
            case 'en cours':
                return 'warning';
            case 'terminé':
                return 'success';
            case 'annulé':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
            try {
                await consultationService.delete(id);
                loadConsultations();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    if (loading) {
        return <Typography>Chargement...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Liste des Consultations</Typography>
                <Button variant="contained" color="primary">
                    Nouvelle Consultation
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Médecin</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Durée</TableCell>
                            <TableCell>Prix</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {consultations.map((consultation) => (
                            <TableRow key={consultation._id}>
                                <TableCell>
                                    {new Date(consultation.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {consultation.medecin.nom} {consultation.medecin.prenom}
                                </TableCell>
                                <TableCell>
                                    {consultation.patient.nom} {consultation.patient.prenom}
                                </TableCell>
                                <TableCell>{consultation.typeConsultation}</TableCell>
                                <TableCell>{consultation.duree} min</TableCell>
                                <TableCell>{consultation.prix} €</TableCell>
                                <TableCell>
                                    <Chip
                                        label={consultation.status}
                                        color={getStatusColor(consultation.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary">
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton size="small" color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(consultation._id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ConsultationList; 