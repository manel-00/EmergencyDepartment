'use client';

import React, { useState, useEffect } from 'react';
import { Paiement } from '@/types/teleconsultation';
import { paiementService } from '@/services/teleconsultationService';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { CreditCard, AccountBalance, PayPal } from '@mui/icons-material';

const PaiementPage = () => {
    const [paiements, setPaiements] = useState<Paiement[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null);
    const [formData, setFormData] = useState({
        montant: 0,
        methodePaiement: 'carte' as const,
        date: new Date().toISOString().split('T')[0],
        reference: ''
    });

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

    const handleOpenDialog = (paiement?: Paiement) => {
        if (paiement) {
            setSelectedPaiement(paiement);
            setFormData({
                montant: paiement.montant,
                methodePaiement: paiement.methodePaiement,
                date: paiement.date.split('T')[0],
                reference: paiement.reference || ''
            });
        } else {
            setSelectedPaiement(null);
            setFormData({
                montant: 0,
                methodePaiement: 'carte',
                date: new Date().toISOString().split('T')[0],
                reference: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPaiement(null);
    };

    const handleSubmit = async () => {
        try {
            if (selectedPaiement) {
                await paiementService.update(selectedPaiement._id, formData);
            } else {
                await paiementService.create(formData);
            }
            loadPaiements();
            handleCloseDialog();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
        }
    };

    const getStatusColor = (status: string) => {
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

    const getMethodeIcon = (methode: string) => {
        switch (methode) {
            case 'carte':
                return <CreditCard />;
            case 'virement':
                return <AccountBalance />;
            case 'paypal':
                return <PayPal />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Container>
                <Typography>Chargement...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Paiements
                </Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
                    Nouveau Paiement
                </Button>
            </Box>

            <Grid container spacing={3}>
                {paiements.map((paiement) => (
                    <Grid item xs={12} md={6} lg={4} key={paiement._id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {getMethodeIcon(paiement.methodePaiement)}
                                    <Typography variant="h6" sx={{ ml: 1 }}>
                                        {paiement.methodePaiement.charAt(0).toUpperCase() + paiement.methodePaiement.slice(1)}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" gutterBottom>
                                    {paiement.montant}€
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Date: {new Date(paiement.date).toLocaleDateString()}
                                </Typography>
                                {paiement.reference && (
                                    <Typography variant="body2" gutterBottom>
                                        Référence: {paiement.reference}
                                    </Typography>
                                )}
                                <Chip
                                    label={paiement.status}
                                    color={getStatusColor(paiement.status)}
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenDialog(paiement)}
                                >
                                    Modifier
                                </Button>
                                {paiement.status === 'en_attente' && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        startIcon={getMethodeIcon(paiement.methodePaiement)}
                                    >
                                        Payer
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedPaiement ? 'Modifier le Paiement' : 'Nouveau Paiement'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Montant"
                            type="number"
                            value={formData.montant}
                            onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                            sx={{ mb: 2 }}
                            inputProps={{ min: 0, step: 0.01 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Méthode de Paiement</InputLabel>
                            <Select
                                value={formData.methodePaiement}
                                label="Méthode de Paiement"
                                onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value as 'carte' | 'virement' | 'paypal' })}
                            >
                                <MenuItem value="carte">Carte Bancaire</MenuItem>
                                <MenuItem value="virement">Virement</MenuItem>
                                <MenuItem value="paypal">PayPal</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            fullWidth
                            label="Référence"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedPaiement ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PaiementPage; 