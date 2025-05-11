const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
};

// Fonctions spécifiques pour différents types d'emails
const emailService = {
    // Email de confirmation de rendez-vous
    sendRendezVousConfirmation: async (rendezVous) => {
        const subject = 'Confirmation de votre rendez-vous';
        const html = `
            <h2>Confirmation de rendez-vous</h2>
            <p>Bonjour ${rendezVous.patient.nom},</p>
            <p>Votre rendez-vous avec Dr. ${rendezVous.medecin.nom} a été confirmé pour le ${new Date(rendezVous.date).toLocaleDateString()}.</p>
            <p>Type de consultation: ${rendezVous.typeConsultation}</p>
            <p>Nous vous attendons !</p>
        `;
        return sendEmail(rendezVous.patient.email, subject, html);
    },

    // Email de rappel de rendez-vous
    sendRendezVousRappel: async (rendezVous) => {
        const subject = 'Rappel de votre rendez-vous';
        const html = `
            <h2>Rappel de rendez-vous</h2>
            <p>Bonjour ${rendezVous.patient.nom},</p>
            <p>Ceci est un rappel pour votre rendez-vous avec Dr. ${rendezVous.medecin.nom} prévu pour le ${new Date(rendezVous.date).toLocaleDateString()}.</p>
            <p>Type de consultation: ${rendezVous.typeConsultation}</p>
            <p>N'oubliez pas votre rendez-vous !</p>
        `;
        return sendEmail(rendezVous.patient.email, subject, html);
    },

    // Email de confirmation de paiement
    sendPaiementConfirmation: async (paiement) => {
        const subject = 'Confirmation de paiement';
        const html = `
            <h2>Confirmation de paiement</h2>
            <p>Bonjour,</p>
            <p>Votre paiement de ${paiement.montant}€ a été confirmé.</p>
            <p>Date: ${new Date(paiement.date).toLocaleDateString()}</p>
            <p>Méthode de paiement: ${paiement.methodePaiement}</p>
            <p>Merci de votre confiance !</p>
        `;
        return sendEmail(paiement.consultation.patient.email, subject, html);
    },

    // Email de facture
    sendFacture: async (consultation) => {
        const subject = 'Votre facture';
        const html = `
            <h2>Facture de consultation</h2>
            <p>Bonjour ${consultation.patient.nom},</p>
            <p>Voici votre facture pour la consultation du ${new Date(consultation.date).toLocaleDateString()}.</p>
            <p>Montant: ${consultation.prix}€</p>
            <p>Type de consultation: ${consultation.typeConsultation}</p>
            <p>Merci de votre confiance !</p>
        `;
        return sendEmail(consultation.patient.email, subject, html);
    }
};

module.exports = emailService; 