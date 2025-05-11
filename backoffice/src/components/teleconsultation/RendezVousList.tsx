import React, { useEffect, useState } from 'react';
import { RendezVous } from '@/types/teleconsultation';
import { rendezVousService } from '@/services/teleconsultationService';
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
import RendezVousForm from './RendezVousForm';

const RendezVousList: React.FC = () => {
    const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous | undefined>();

    useEffect(() => {
        loadRendezVous();
    }, []);

    const loadRendezVous = async () => {
        try {
            const data = await rendezVousService.getAll();
            setRendezVous(data);
        } catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: RendezVous['status']) => {
        switch (status) {
            case 'planifié':
                return 'primary';
            case 'confirmé':
                return 'success';
            case 'annulé':
                return 'error';
            case 'terminé':
                return 'info';
            default:
                return 'default';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
            try {
                await rendezVousService.delete(id);
                loadRendezVous();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleConfirmer = async (id: string) => {
        try {
            await rendezVousService.confirmer(id);
            loadRendezVous();
        } catch (error) {
            console.error('Erreur lors de la confirmation:', error);
        }
    };

    const handleAnnuler = async (id: string) => {
        try {
            await rendezVousService.annuler(id);
            loadRendezVous();
        } catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
        }
    };

    const handleEdit = (rdv: RendezVous) => {
        setSelectedRendezVous(rdv);
        setShowForm(true);
    };

    const handleCreate = () => {
        setSelectedRendezVous(undefined);
        setShowForm(true);
    };

    if (loading) {
        return <Typography>Chargement...</Typography>;
    }

    if (showForm) {
        return (
            <RendezVousForm
                rendezVous={selectedRendezVous}
                onSuccess={() => {
                    setShowForm(false);
                    loadRendezVous();
                }}
                onCancel={() => setShowForm(false)}
            />
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Liste des Rendez-vous</Typography>
                <Button variant="contained" color="primary" onClick={handleCreate}>
                    Nouveau Rendez-vous
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
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rendezVous.map((rdv) => (
                            <TableRow key={rdv._id}>
                                <TableCell>
                                    {new Date(rdv.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {rdv.medecin.nom} {rdv.medecin.prenom}
                                </TableCell>
                                <TableCell>
                                    {rdv.patient.nom} {rdv.patient.prenom}
                                </TableCell>
                                <TableCell>{rdv.typeConsultation}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={rdv.status}
                                        color={getStatusColor(rdv.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary">
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEdit(rdv)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    {rdv.status === 'planifié' && (
                                        <>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleConfirmer(rdv._id)}
                                            >
                                                ✓
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleAnnuler(rdv._id)}
                                            >
                                                ✕
                                            </IconButton>
                                        </>
                                    )}
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(rdv._id)}
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

export default RendezVousList; 