import axios from 'axios';
import { Consultation, RendezVous, Paiement } from '@/types/teleconsultation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const consultationService = {
    getAll: async (): Promise<Consultation[]> => {
        const response = await axios.get(`${API_URL}/consultations`);
        return response.data;
    },

    getById: async (id: string): Promise<Consultation> => {
        const response = await axios.get(`${API_URL}/consultations/${id}`);
        return response.data;
    },

    create: async (data: Partial<Consultation>): Promise<Consultation> => {
        const response = await axios.post(`${API_URL}/consultations`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Consultation>): Promise<Consultation> => {
        const response = await axios.put(`${API_URL}/consultations/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/consultations/${id}`);
    }
};

export const rendezVousService = {
    getAll: async (): Promise<RendezVous[]> => {
        const response = await axios.get(`${API_URL}/rendez-vous`);
        return response.data;
    },

    getById: async (id: string): Promise<RendezVous> => {
        const response = await axios.get(`${API_URL}/rendez-vous/${id}`);
        return response.data;
    },

    create: async (data: Partial<RendezVous>): Promise<RendezVous> => {
        const response = await axios.post(`${API_URL}/rendez-vous`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<RendezVous>): Promise<RendezVous> => {
        const response = await axios.put(`${API_URL}/rendez-vous/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/rendez-vous/${id}`);
    }
};

export const paiementService = {
    getAll: async (): Promise<Paiement[]> => {
        const response = await axios.get(`${API_URL}/paiements`);
        return response.data;
    },

    getById: async (id: string): Promise<Paiement> => {
        const response = await axios.get(`${API_URL}/paiements/${id}`);
        return response.data;
    },

    create: async (data: Partial<Paiement>): Promise<Paiement> => {
        const response = await axios.post(`${API_URL}/paiements`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Paiement>): Promise<Paiement> => {
        const response = await axios.put(`${API_URL}/paiements/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/paiements/${id}`);
    }
}; 