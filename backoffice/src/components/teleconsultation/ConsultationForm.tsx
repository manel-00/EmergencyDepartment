import React, { useState, useEffect } from 'react';
import { Consultation } from '@/types/teleconsultation';
import { consultationService } from '@/services/teleconsultationService';
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

interface ConsultationFormProps {
    consultation?: Consultation;
    onSuccess: () => void;
    onCancel: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ consultation, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Consultation>>({
        date: new Date().toISOString().split('T')[0],
        typeConsultation: '',
        duree: 30,
        prix: 0,
        status: 'planifié',
        notes: ''
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (consultation) {
            setFormData(consultation);
        }
    }, [consultation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (consultation?._id) {
                await consultationService.update(consultation._id, formData);
            } else {
                await consultationService.create(formData);
            }
            onSuccess();
        } catch (err) {
            setError('Une erreur est survenue lors de l\'enregistrement de la consultation.');
            console.error('Erreur lors de l\'enregistrement de la consultation:', err);
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
                {consultation ? 'Modifier la Consultation' : 'Nouvelle Consultation'}
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
                        label="Date"
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Type de Consultation</InputLabel>
                        <Select
                            name="typeConsultation"
                            value={formData.typeConsultation}
                            label="Type de Consultation"
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="visio">Visio</MenuItem>
                            <MenuItem value="audio">Audio</MenuItem>
                            <MenuItem value="chat">Chat</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Durée (minutes)"
                        type="number"
                        name="duree"
                        value={formData.duree}
                        onChange={handleChange}
                        required
                        inputProps={{ min: 15, step: 15 }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Prix (€)"
                        type="number"
                        name="prix"
                        value={formData.prix}
                        onChange={handleChange}
                        required
                        inputProps={{ min: 0, step: 0.01 }}
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
                            <MenuItem value="planifié">Planifié</MenuItem>
                            <MenuItem value="en_cours">En cours</MenuItem>
                            <MenuItem value="terminé">Terminé</MenuItem>
                            <MenuItem value="annulé">Annulé</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Notes"
                        name="notes"
                        multiline
                        rows={4}
                        value={formData.notes || ''}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={onCancel}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            {consultation ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ConsultationForm; 