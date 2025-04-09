'use client';

import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography } from '@mui/material';
import ConsultationList from '@/components/teleconsultation/ConsultationList';
import ConsultationForm from '@/components/teleconsultation/ConsultationForm';
import RendezVousList from '@/components/teleconsultation/RendezVousList';
import PaiementList from '@/components/teleconsultation/PaiementList';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`teleconsultation-tabpanel-${index}`}
            aria-labelledby={`teleconsultation-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function TeleconsultationPage() {
    const [tabValue, setTabValue] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Gestion des Téléconsultations
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="téléconsultation tabs"
                    >
                        <Tab label="Consultations" />
                        <Tab label="Rendez-vous" />
                        <Tab label="Paiements" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    {showForm ? (
                        <ConsultationForm
                            onSuccess={() => {
                                setShowForm(false);
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    ) : (
                        <ConsultationList />
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <RendezVousList />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <PaiementList />
                </TabPanel>
            </Box>
        </Container>
    );
} 