const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const auth = require('../middleware/auth');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51P8XUwKkTRnXnW8c5kSLd5iVZhhkLHWtJsevsCWjEwCZIufu9pRV3jFw6zUut9dwBg1ebPMP8XlCsm965ygZW42z00CErciZ79');

// Routes protégées par authentification
router.use(auth);

// Routes pour les consultations
router.post('/', consultationController.createConsultation);
router.get('/', consultationController.getAllConsultations);
router.get('/:id', consultationController.getConsultationById);
router.put('/:id', consultationController.updateConsultation);
router.delete('/:id', consultationController.deleteConsultation);

// Routes spécifiques
router.get('/medecin/:medecinId', consultationController.getConsultationsByMedecin);
router.get('/patient/:patientId', consultationController.getConsultationsByPatient);

// Terminer une consultation
router.post('/:id/end', async (req, res) => {
  try {
    const Consultation = require('../../models/Consultation');
    const RendezVous = require('../../models/RendezVous');

    // First try to find as a consultation
    let consultation = await Consultation.findById(req.params.id);

    // If not found as consultation, try to find as a rendez-vous
    if (!consultation) {
      const rendezVous = await RendezVous.findById(req.params.id);

      if (rendezVous) {
        // If rendez-vous has a linked consultation, use that
        if (rendezVous.consultation) {
          consultation = await Consultation.findById(rendezVous.consultation);
        }

        // If no linked consultation, update the rendez-vous status
        if (!consultation) {
          rendezVous.status = 'terminé';
          await rendezVous.save();
          return res.json({
            message: 'Rendez-vous terminé avec succès',
            rendezVous
          });
        }
      } else {
        return res.status(404).json({ message: 'Consultation ou rendez-vous non trouvé' });
      }
    }

    // Update the consultation status if found
    if (consultation) {
      consultation.status = 'terminé';
      await consultation.save();
      return res.json({
        message: 'Consultation terminée avec succès',
        consultation
      });
    }

    // If we get here, neither consultation nor rendez-vous was found
    return res.status(404).json({ message: 'Consultation ou rendez-vous non trouvé' });
  } catch (error) {
    console.error('Erreur lors de la fin de la consultation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create payment session for a consultation
router.post('/:id/payment', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    const Consultation = require('../../models/Consultation');
    const RendezVous = require('../../models/RendezVous');
    const User = require('../../models/User');

    // First try to find as a consultation
    let consultation = await Consultation.findById(req.params.id);
    let rendezVous = null;

    // If not found as consultation, try to find as a rendez-vous
    if (!consultation) {
      rendezVous = await RendezVous.findById(req.params.id);

      if (rendezVous && rendezVous.consultation) {
        consultation = await Consultation.findById(rendezVous.consultation);
      }
    }

    // Use either consultation or rendez-vous data
    const appointmentData = consultation || rendezVous;

    if (!appointmentData) {
      return res.status(404).json({ message: 'Consultation or appointment not found' });
    }

    // Check if the status is completed
    if (appointmentData.status.toLowerCase() !== 'terminé' &&
        appointmentData.status.toLowerCase() !== 'completed') {
      return res.status(400).json({
        message: 'Payment can only be processed for completed consultations'
      });
    }

    // Check if already paid
    if (appointmentData.isPaid) {
      return res.status(400).json({ message: 'This consultation has already been paid' });
    }

    // Get the price from the appointment data
    const price = appointmentData.prix || 50; // Default price if not set

    // Get patient email from the request or try to find it in the database
    let email = patientEmail;

    if (!email && appointmentData.patient) {
      try {
        const patientUser = await User.findById(appointmentData.patient);
        if (patientUser && patientUser.email) {
          email = patientUser.email;
        }
      } catch (err) {
        console.log('Could not find patient email in database:', err);
      }
    }

    // If still no email, use a default
    if (!email) {
      email = 'patient@example.com';
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Medical Consultation Payment',
              description: `Consultation on ${new Date(appointmentData.date).toLocaleDateString()}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/rendez-vous?payment_success=true&id=${appointmentData._id}`,
      cancel_url: `${req.headers.origin}/rendez-vous?payment_cancelled=true&id=${appointmentData._id}`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark consultation as paid
router.post('/:id/mark-paid', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const Consultation = require('../../models/Consultation');
    const RendezVous = require('../../models/RendezVous');

    // Verify the payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment has not been completed' });
    }

    // First try to find as a consultation
    let consultation = await Consultation.findById(req.params.id);
    let rendezVous = null;

    // If not found as consultation, try to find as a rendez-vous
    if (!consultation) {
      rendezVous = await RendezVous.findById(req.params.id);

      if (rendezVous && rendezVous.consultation) {
        consultation = await Consultation.findById(rendezVous.consultation);
      }
    }

    // Update either consultation or rendez-vous
    if (consultation) {
      consultation.isPaid = true;
      consultation.paymentDate = new Date();
      consultation.paymentSessionId = sessionId;
      await consultation.save();
    }

    if (rendezVous) {
      rendezVous.isPaid = true;
      rendezVous.paymentDate = new Date();
      rendezVous.paymentSessionId = sessionId;
      await rendezVous.save();
    }

    if (!consultation && !rendezVous) {
      return res.status(404).json({ message: 'Consultation or appointment not found' });
    }

    res.json({
      message: 'Payment recorded successfully',
      consultation: consultation || null,
      rendezVous: rendezVous || null
    });
  } catch (error) {
    console.error('Error marking consultation as paid:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
