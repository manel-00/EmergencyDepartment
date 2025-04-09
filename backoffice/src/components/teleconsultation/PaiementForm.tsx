import React, { useState, useEffect } from 'react';
import { Paiement } from '@/types/teleconsultation';
import { paiementService } from '@/services/teleconsultationService';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Grid,
    SelectChangeEvent
} from '@mui/material';

interface PaiementFormProps {
    paiement?: Paiement;
    onSuccess: () => void;
    onCancel: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({ paiement, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Paiement>>({
        montant: 0,
        methodePaiement: 'carte',
        date: new Date().toISOString().split('T')[0],
        status: 'en_attente',
        reference: ''
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (paiement) {
            setFormData(paiement);
        }
    }, [paiement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (paiement?._id) {
                await paiementService.update(paiement._id, formData);
            } else {
                await paiementService.create(formData);
            }
            onSuccess();
        } catch (err) {
            setError('Une erreur est survenue lors de l\'enregistrement du paiement.');
            console.error('Erreur lors de l\'enregistrement du paiement:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {paiement ? 'Modifier le Paiement' : 'Nouveau Paiement'}
            </Typography>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Montant"
                        type="number"
                        name="montant"
                        value={formData.montant}
                        onChange={handleChange}
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Méthode de Paiement</InputLabel>
                        <Select
                            name="methodePaiement"
                            value={formData.methodePaiement}
                            label="Méthode de Paiement"
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="carte">Carte Bancaire</MenuItem>
                            <MenuItem value="virement">Virement</MenuItem>
                            <MenuItem value="paypal">PayPal</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Statut</InputLabel>
                        <Select
                            name="status"
                            value={formData.status}
                            label="Statut"
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="en_attente">En attente</MenuItem>
                            <MenuItem value="validé">Validé</MenuItem>
                            <MenuItem value="refusé">Refusé</MenuItem>
                            <MenuItem value="remboursé">Remboursé</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Référence"
                        name="reference"
                        value={formData.reference || ''}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={onCancel}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            {paiement ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PaiementForm; 