export interface Consultation {
    _id: string;
    date: string;
    medecin: {
        _id: string;
        nom: string;
        prenom: string;
        specialite: string;
        photo?: string;
    };
    patient: {
        _id: string;
        nom: string;
        prenom: string;
        email: string;
    };
    type: 'video' | 'audio' | 'chat';
    duree: number;
    prix: number;
    status: 'en_attente' | 'confirmé' | 'annulé' | 'terminé';
    notes?: string;
    lienVideo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RendezVous {
    _id: string;
    date: string;
    type: 'video' | 'audio' | 'chat';
    medecin: {
        _id: string;
        nom: string;
        prenom: string;
        specialite: string;
        photo?: string;
    };
    patient: {
        _id: string;
        nom: string;
        prenom: string;
        email: string;
    };
    status: 'en_attente' | 'confirmé' | 'annulé';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Paiement {
    _id: string;
    montant: number;
    methodePaiement: 'carte' | 'virement' | 'paypal';
    date: string;
    status: 'en_attente' | 'validé' | 'refusé' | 'remboursé';
    reference?: string;
    consultation?: string;
    createdAt: string;
    updatedAt: string;
} 