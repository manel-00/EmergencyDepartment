import React, { useEffect, useState } from 'react';
import { Paiement } from '@/types/teleconsultation';
import { paiementService } from '@/services/teleconsultationService';
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
import PaiementForm from './PaiementForm';

const PaiementList: React.FC = () => {
    const [paiements, setPaiements] = useState<Paiement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedPaiement, setSelectedPaiement] = useState<Paiement | undefined>();

    useEffect(() => {
        loadPaiements();
    }, []);

    const loadPaiements = async () => {
        try {
            const data = await paiementService.getAll();
            setPaiements(data);
        } catch (error) {
            console.error('Erreur lors du chargement des paiements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: Paiement['status']) => {
        switch (status) {
            case 'en_attente':
                return 'warning';
            case 'validé':
                return 'success';
            case 'refusé':
                return 'error';
            case 'remboursé':
                return 'info';
            default:
                return 'default';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
            try {
                await paiementService.delete(id);
                loadPaiements();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleEdit = (paiement: Paiement) => {
        setSelectedPaiement(paiement);
        setShowForm(true);
    };

    const handleCreate = () => {
        setSelectedPaiement(undefined);
        setShowForm(true);
    };

    if (loading) {
        return <Typography>Chargement...</Typography>;
    }

    if (showForm) {
        return (
            <PaiementForm
                paiement={selectedPaiement}
                onSuccess={() => {
                    setShowForm(false);
                    loadPaiements();
                }}
                onCancel={() => setShowForm(false)}
            />
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Liste des Paiements</Typography>
                <Button variant="contained" color="primary" onClick={handleCreate}>
                    Nouveau Paiement
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Consultation</TableCell>
                            <TableCell>Montant</TableCell>
                            <TableCell>Méthode</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paiements.map((paiement) => (
                            <TableRow key={paiement._id}>
                                <TableCell>
                                    {new Date(paiement.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {paiement.consultation._id}
                                </TableCell>
                                <TableCell>
                                    {paiement.montant} €
                                </TableCell>
                                <TableCell>{paiement.methodePaiement}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={paiement.status}
                                        color={getStatusColor(paiement.status)}
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
                                        onClick={() => handleEdit(paiement)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(paiement._id)}
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

export default PaiementList; 