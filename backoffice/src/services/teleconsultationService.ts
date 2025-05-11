import axios from 'axios';
import { Consultation, Paiement, RendezVous } from '../types/teleconsultation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Services pour les consultations
export const consultationService = {
    getAll: async (): Promise<Consultation[]> => {
        const response = await axios.get(`${API_URL}/api/consultations`);
        return response.data;
    },

    getById: async (id: string): Promise<Consultation> => {
        const response = await axios.get(`${API_URL}/api/consultations/${id}`);
        return response.data;
    },

    create: async (data: Partial<Consultation>): Promise<Consultation> => {
        const response = await axios.post(`${API_URL}/api/consultations`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Consultation>): Promise<Consultation> => {
        const response = await axios.put(`${API_URL}/api/consultations/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/consultations/${id}`);
    },

    getByMedecin: async (medecinId: string): Promise<Consultation[]> => {
        const response = await axios.get(`${API_URL}/api/consultations/medecin/${medecinId}`);
        return response.data;
    },

    getByPatient: async (patientId: string): Promise<Consultation[]> => {
        const response = await axios.get(`${API_URL}/api/consultations/patient/${patientId}`);
        return response.data;
    }
};

// Services pour les paiements
export const paiementService = {
    getAll: async (): Promise<Paiement[]> => {
        const response = await axios.get(`${API_URL}/api/paiements`);
        return response.data;
    },

    getById: async (id: string): Promise<Paiement> => {
        const response = await axios.get(`${API_URL}/api/paiements/${id}`);
        return response.data;
    },

    create: async (data: Partial<Paiement>): Promise<Paiement> => {
        const response = await axios.post(`${API_URL}/api/paiements`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Paiement>): Promise<Paiement> => {
        const response = await axios.put(`${API_URL}/api/paiements/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/paiements/${id}`);
    },

    updateStatus: async (id: string, status: Paiement['status']): Promise<Paiement> => {
        const response = await axios.put(`${API_URL}/api/paiements/${id}/status`, { status });
        return response.data;
    }
};

// Services pour les rendez-vous
export const rendezVousService = {
    getAll: async (): Promise<RendezVous[]> => {
        const response = await axios.get(`${API_URL}/api/rendez-vous`);
        return response.data;
    },

    getById: async (id: string): Promise<RendezVous> => {
        const response = await axios.get(`${API_URL}/api/rendez-vous/${id}`);
        return response.data;
    },

    create: async (data: Partial<RendezVous>): Promise<RendezVous> => {
        const response = await axios.post(`${API_URL}/api/rendez-vous`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<RendezVous>): Promise<RendezVous> => {
        const response = await axios.put(`${API_URL}/api/rendez-vous/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/rendez-vous/${id}`);
    },

    confirmer: async (id: string): Promise<RendezVous> => {
        const response = await axios.put(`${API_URL}/api/rendez-vous/${id}/confirmer`);
        return response.data;
    },

    annuler: async (id: string): Promise<RendezVous> => {
        const response = await axios.put(`${API_URL}/api/rendez-vous/${id}/annuler`);
        return response.data;
    }
}; 