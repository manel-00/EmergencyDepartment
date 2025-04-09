export interface Consultation {
    _id: string;
    date: string;
    medecin: {
        _id: string;
        nom: string;
        prenom: string;
    };
    patient: {
        _id: string;
        nom: string;
        prenom: string;
    };
    typeConsultation: string;
    duree: number;
    prix: number;
    status: 'planifié' | 'en_cours' | 'terminé' | 'annulé';
    notes?: string;
    notesMedicales?: string;
    documents?: string[];
    lienVisio?: string;
    paiement?: Paiement;
    createdAt: string;
    updatedAt: string;
}

export interface Paiement {
    _id: string;
    consultation: {
        _id: string;
    };
    montant: number;
    methodePaiement: 'carte' | 'virement' | 'paypal';
    date: string;
    status: 'en_attente' | 'validé' | 'refusé' | 'remboursé';
    reference?: string;
    transactionId?: string;
    remboursement?: {
        montant: number;
        date: string;
        raison: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface RendezVous {
    _id: string;
    date: string;
    medecin: {
        _id: string;
        nom: string;
        prenom: string;
    };
    patient: {
        _id: string;
        nom: string;
        prenom: string;
    };
    typeConsultation: string;
    status: 'planifié' | 'confirmé' | 'annulé' | 'terminé';
    notes?: string;
    rappels?: string[];
    consultation?: Consultation;
    createdAt: string;
    updatedAt: string;
} 