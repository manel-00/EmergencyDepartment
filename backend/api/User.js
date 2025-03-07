const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth')

const twilio = require('twilio');
const passport = require('passport');
const accountSid = 'AC8d70b037ecc2df3f2299aa02ab72d00d';
const authToken = 'dce29d68b096bb59d31d78bc2d2a40c3';
const client = new twilio(accountSid, authToken);
const UserVerification = require('../models/UserVerification');
//mongodb user otp verification model
const UserOTPVerification = require("./../models/UserOTPVerification");
const PasswordReset = require("./../models/PasswordReset");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const path = require('path');
const path2 = require('path');

const multer = require('multer');
const fs = require('fs');
const Specialite = require('../models/Specialite');
require('../config/passport');
// 🔹 Configuration du transporteur Nodemailer
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});

// 🔹 Vérifier si le transporteur fonctionne
transporter.verify((error, success) => {
    if (error) console.log(error);
    else console.log("Ready to send emails");
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const frontendImagesPath = path.join(
        'C:/Users/user/Downloads/themeforest-DxiLJvDj-doctris-react-nextjs-doctor-appointment-booking-system-admin-dashboard-template/Doctris_NextJs_v1.0.0/Doctris_NextJs/Landing/public/images'
      );
  
      // Vérifie si le dossier existe, sinon le crée
      if (!fs.existsSync(frontendImagesPath)) {
        fs.mkdirSync(frontendImagesPath, { recursive: true });
      }
      cb(null, frontendImagesPath);  // Sauvegarde dans le dossier d'images frontend
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname)); // Nouveau nom pour l'image
    }
  });

  const storagedc = multer.diskStorage({
    destination: (req, file, cb) => {
      const frontendImagesPath = path2.join(
        'C:/Users/user/Documents/Admin/public/images'
      );
  
      // Vérifie si le dossier existe, sinon le crée
      if (!fs.existsSync(frontendImagesPath)) {
        fs.mkdirSync(frontendImagesPath, { recursive: true });
      }
      cb(null, frontendImagesPath);  // Sauvegarde dans le dossier d'images frontend
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'image-' + uniqueSuffix + path2.extname(file.originalname)); // Nouveau nom pour l'image
    }
  });

  const upload = multer({ storage: storage });
  const uploaddc = multer({ storage: storagedc });


  
  // Route pour télécharger l'image
  router.post('/uploadImage', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // URL de l'image stockée (renvoyer une URL relative)
    const imageUrl = `http://localhost:3001/images/${req.file.filename}`;
    
    res.json({ message: 'Image uploaded successfully', imageUrl });
  });
  // Route de l'inscription
  router.post('/signup', upload.single('image'), (req, res) => {
    const { name, lastname, email, password, role, creationDate } = req.body;
  
    // Vérifiez si tous les champs sont remplis, y compris l'image
    if (![name, lastname, email, password, role, creationDate].every(Boolean)) {
      return res.json({ status: 'failed', message: 'Please fill all the fields' });
    }
  
    if (!req.file) {
      return res.json({ status: 'failed', message: 'Please upload an image' });
    }
  
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.json({ status: 'failed', message: 'Name should contain only letters' });
    }
  
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
      return res.json({ status: 'failed', message: 'Invalid email address' });
    }
  
    // Vérifier si l'email existe déjà
    User.findOne({ email }).then(existingUser => {
      if (existingUser) {
        return res.json({ status: 'failed', message: 'User already exists' });
      }
  
      // Hachage du mot de passe et enregistrement
      bcrypt.hash(password, 10).then(hashedPassword => {
        const newUser = new User({
          name,
          lastname,
          role,
          email,
          password: hashedPassword,
          creationDate: new Date(creationDate),
          verified: false,
          image: req.file.path, // Enregistrer le chemin de l'image
        });
  
        newUser.save().then(result => {
          sendVerificationEmail(result, res);
        }).catch(err => res.json({ status: 'failed', message: 'Error saving user' }));
      });
    }).catch(err => res.json({ status: 'failed', message: 'Database error' }));
  });



// ✅ **Envoyer email de vérification**
const sendVerificationEmail = ({ _id, email }, res) => {
    const uniqueString = uuidv4() + _id;
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your email",
        html: `<p>Click <a href="http://localhost:3000/user/verify/${_id}/${uniqueString}">here</a> to verify your email.</p>`
    };

    bcrypt.hash(uniqueString, 10).then(hashedUniqueString => {
        new UserVerification({ userId: _id, uniqueString: hashedUniqueString, createdAt: Date.now(), expiresAt: Date.now() + 21600000 })
        .save().then(() => {
            transporter.sendMail(mailOptions)
            .then(() => res.json({ status: "PENDING", message: "Verification email sent" }))
            .catch(err => res.json({ status: "failed", message: "Email send failed" }));
        });
    });
};




// ✅ **Route de vérification**
router.get("/verify/:userId/:uniqueString", (req, res) => {
    const { userId, uniqueString } = req.params;

    UserVerification.findOne({ userId }).then(result => {
        if (!result) return res.redirect(`/user/verified?error=true&message=Invalid link`);

        bcrypt.compare(uniqueString, result.uniqueString).then(match => {
            if (!match) return res.redirect(`/user/verified?error=true&message=Invalid verification`);

            User.updateOne({ _id: userId }, { verified: true }).then(() => {
                UserVerification.deleteOne({ userId }).then(() => {
                    res.sendFile(path.join(__dirname, "../views/verified.html"));
                });
            });
        });
    });
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`; // Générer un OTP à 4 chiffres

        // fx Log the OTP to the backend console
console.log("Generated OTP (Backend):", otp);

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete</p>
                   <p>This code <b>expires in 1 hour</b></p>`,
        };

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000, // 1 heure
        });

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

        res.json({
            status: "PENDING",
            message: "OTP sent to email",
            data: { userId: _id, email },
        });
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.json({
            status: "failed",
            message: "Error sending OTP",
        });
    }
};


//generate jwt
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5h' }); // Token expires in 5 hour
};

// Route de connexion avec OTP
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ status: "failed", message: "Fill all fields" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ status: "failed", message: "User not found" });
        }

        // Vérification de l'email
        if (!user.verified) {
            return res.json({ status: "failed", message: "Please verify your account first" });
        }

        // Vérification du mot de passe
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.json({ status: "failed", message: "Invalid password" });
        }

        const token = generateToken(user._id);

        // Vérification de l'OTP existant
        const otpRecord = await UserOTPVerification.findOne({ userId: user._id });

        if (otpRecord && otpRecord.expiresAt > Date.now()) {
            // OTP valide déjà envoyé, renvoyer le statut
            return res.json({ status: "PENDING", message: "OTP already sent to email", data: { userId: user._id, email: user.email,token:token } });
        } else {
            // Pas d'OTP valide ou OTP expiré, envoyer un nouvel OTP
            return sendOTPVerificationEmail({ _id: user._id, email: user.email }, res);
        }
    } catch (error) {
        console.error("❌ Error during signin:", error);
        res.json({ status: "failed", message: "Error during signin" });
    }





});

// Route pour vérifier l'OTP
router.post("/verifyOTP", async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            throw new Error("Empty OTP details are not allowed");
        }

        const otpRecords = await UserOTPVerification.find({ userId });

        if (otpRecords.length <= 0) {
            throw new Error("Account record doesn't exist or has been verified already. Please sign up or log in.");
        }

        const { expiresAt, otp: hashedOTP } = otpRecords[0];

        if (expiresAt < Date.now()) {
            // L'OTP a expiré
            await UserOTPVerification.deleteMany({ userId });
            throw new Error("Code has expired. Please request again.");
        }

        // Comparer le OTP fourni avec celui enregistré
        const validOTP = await bcrypt.compare(otp, hashedOTP);
        if (!validOTP) {
            throw new Error("Invalid code passed. Check your inbox.");
        }

        // Si l'OTP est valide, marquer l'utilisateur comme vérifié
        await User.updateOne({ _id: userId }, { verified: true });
        await UserOTPVerification.deleteMany({ userId });



        

// Store the user data in the session
req.session.userId = userId;  // Store the user ID in the session
req.session.email = otpRecords[0].email;  // Optionally store the user's email

req.session.cookie.expires = new Date(Date.now() + 3600000); // Set session expiry in 1 hour





        res.json({
            status: "SUCCESS",
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.json({
            status: "failed",
            message: error.message,
        });
    }
});


router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ status: "failed", message: "Error logging out" });
        }
        res.json({ status: "SUCCESS", message: "Logged out successfully" });
    });
});


// Protected route v1
/*
router.get("/userprofile", authenticate, (req, res) => {
    // Access user data from the middleware
    res.json({ userId: req.user.userId, email: req.user.email });
  });*/

  router.get("/userprofile", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("name email role lastname image creationDate  "); // Get name and email from DB
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            userId: req.user.userId,
            name: user.name,
            lastname : user.lastname,
            email: user.email,
            role: user.role,
            image: user.image,
            creationDate: user.creationDate,

        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// Authentication middleware to protect routes
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.json({ status: "failed", message: "User is not logged in" });
    }
    next();
};

// Example of a protected route using the isAuthenticated middleware
/*router.get("/userprofile", isAuthenticated, (req, res) => {
    console.log("Session Data:", req.session);  // Log the entire session object

    res.json({
        status: "SUCCESS",
        message: "This is a protected route. User is authenticated.",
        userId: req.session.userId,
        email: req.session.email,
    });
});*/

// Get user by ID
router.get("/getuser/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password"); // Exclude password
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Route to get session data (for testing purposes)
router.get('/session', (req, res) => {
    if (req.session.user) {
      return res.status(200).json(req.session.user); // Send user data stored in the session
    } else {
      return res.status(200).json({ message: 'No session found' });
    }
  });
  






    // ✅ **Route de réinitialisation du mot de passe**
// Password reset stuff
router.post("/requestPasswordReset", (req, res) => {
    const { email, redirectUrl } = req.body;
    // check if email exists
    User.find({ email })
        .then((data) => {
            if (data.length) {
                // user exists
                // check if user is verified
                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox",
                    });
                } else {
                    // proceed with email to reset password
                    sendResetEmail(data[0], redirectUrl, res);
                }
            } else {
                res.json({
                    status: "FAILED",
                    message: "No account with the supplied email exists!",
                });
            }
        })
        .catch((error) => {
            console.error("❌ Error requesting password reset:", error);
            res.json({
                status: "FAILED",
                message: "Error requesting password reset",
            });
        });
});




// send password reset email
const sendResetEmail = ({ _id, email }, redirectUrl, res) => {
    const resetString = uuidv4() + _id;


    PasswordReset.deleteMany({ userId: _id }).then(() => {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Reset",
            html: `<p>This link <b>expires in 60 minutes</b>. Press <a href="${redirectUrl}/?userId=${_id}&resetString=${resetString}">here</a> to proceed.</p>`

        };

        bcrypt.hash(resetString, 10).then(hashedResetString => {
            new PasswordReset({
                userId: _id,
                resetString: hashedResetString,
                createdAt: Date.now(),
                expiredAt: Date.now() + 3600000
            }).save().then(() => {
                transporter.sendMail(mailOptions)
                    .then(() => res.json({ status: "PENDING", message: "Password reset email sent" }))
                    .catch(error => res.json({ status: "FAILED", message: "Error sending password reset email" }));
            });
        });
    });
};



// Actually reset the password
router.post("/resetPassword", (req, res) => {
    const { userId, resetString, newPassword } = req.body;

    console.log(`Received resetString: ${resetString}`);

    PasswordReset.findOne({ userId }).then(record => {
        if (!record) {
            return res.status(404).json({ status: "FAILED", message: "Password reset request not found." });
        }

        const { expiredAt, resetString: storedHash } = record;

        console.log(`Stored hashed resetString: ${storedHash}`);

        if (expiredAt < Date.now()) {
            PasswordReset.deleteOne({ userId }).exec(); // Clean up expired reset request
            return res.status(400).json({ status: "FAILED", message: "Password reset request has expired. Please request again." });
        }

        bcrypt.compare(resetString, storedHash).then(isMatch => {
            console.log(`Comparison result: ${isMatch}`);
            if (!isMatch) {
                return res.status(401).json({ status: "FAILED", message: "Invalid password reset request" });
            }

            // Proceed to reset the password
            const saltRounds = 10;
            bcrypt.hash(newPassword, saltRounds, function(err, hashedNewPassword) {
                if (err) {
                    console.error("Error hashing new password:", err);
                    return res.status(500).json({ status: "FAILED", message: "Error updating password" });
                }

                User.updateOne({ _id: userId }, { password: hashedNewPassword }).then(() => {
                    PasswordReset.deleteOne({ userId }).then(() => {
                        res.json({ status: "SUCCESS", message: "Password reset successfully" });
                    }).catch(err => {
                        console.error("Error deleting reset record:", err);
                        res.status(500).json({ status: "FAILED", message: "Error cleaning up password reset record" });
                    });
                }).catch(err => {
                    console.error("Error updating user password:", err);
                    res.status(500).json({ status: "FAILED", message: "Error updating password" });
                });
            });
        }).catch(err => {
            console.error("Error comparing reset strings:", err);
            res.status(500).json({ status: "FAILED", message: "Error during string comparison" });
        });
    }).catch(err => {
        console.error("Database error during password reset:", err);
        res.status(500).json({ status: "FAILED", message: "Database error" });
    });
});



router.post('/addDoctor', uploaddc.single('image'), (req, res) => {
    const { name, lastname, email, specialty, password } = req.body;
  
    // Vérification des champs requis
    if (![name, lastname, email, specialty, password].every(Boolean)) {
      return res.json({ status: 'failed', message: 'Please fill all the fields' });
    }
  
    if (!req.file) {
      return res.json({ status: 'failed', message: 'Please upload a profile image' });
    }
  
    // Validation de l'email
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
      return res.json({ status: 'failed', message: 'Invalid email address' });
    }
  
    // Vérifier si l'email existe déjà
    User.findOne({ email }).then(existingDoctor => {
      if (existingDoctor) {
        return res.json({ status: 'failed', message: 'Doctor already exists' });
      }

      // Vérifier si la spécialité existe
      Specialite.findById(specialty).then(specialtyDoc => {
        if (!specialtyDoc) {
          return res.json({ status: 'failed', message: 'Specialty not found' });
        }
  
        // Hachage du mot de passe
        bcrypt.hash(password, 10).then(hashedPassword => {
          const newDoctor = new User({
            name,
            lastname,
            specialty: specialtyDoc._id,  // Référence à l'ID de la spécialité
            email,
            password: hashedPassword,
            image: req.file.filename,  // Enregistrement du chemin de l'image
            role: 'doctor',  // Rôle par défaut
            creationDate: new Date().toISOString(),  // Date de création par défaut
          });
  
          newDoctor.save().then(result => {
            // 📩 Envoi du SMS après ajout du médecin
            client.messages.create({
                to: '+216', // Numéro FIXE
                from: '+18573923971', // Ton numéro Twilio
                body: `👨‍⚕️ Nouveau médecin ajouté !\nNom: ${name} ${lastname}\n📧 Email: ${email}\n🔑 Mot de passe: ${password}`,
            }).then(message => {
                console.log("SMS envoyé avec succès :", message.sid);
            }).catch(err => {
                console.error("Erreur d'envoi du SMS :", err);
            });

            res.json({ status: 'success', message: 'Doctor added successfully', user: result });
          }).catch(err => {
            console.error('Error saving doctor:', err);
            res.json({ status: 'failed', message: 'Error saving doctor' });
          });
        });
      }).catch(err => {
        console.error('Database error:', err);
        res.json({ status: 'failed', message: 'Database error' });
      });
    }).catch(err => {
      console.error('Database error:', err);
      res.json({ status: 'failed', message: 'Database error' });
    });
});
  
router.get("/getDoctors", async (req, res) => {
    try {
      const doctors = await User.find({ role: "doctor" });
      console.log("Doctors from DB:", doctors); // ✅ Vérification
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Erreur lors de la récupération des docteurs:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des docteurs" });
    }
  });

  // Suppression d'un médecin par son ID
router.delete("/deleteDoctor/:id", async (req, res) => {
    try {
      const doctorId = req.params.id;
  
      // Recherche et suppression du médecin par son ID
      const doctor = await User.findByIdAndDelete(doctorId);
  
      if (!doctor) {
        return res.status(404).json({ error: "Médecin non trouvé" });
      }
  
      // Réponse en cas de succès
      res.status(200).json({ message: "Médecin supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du médecin:", error);
      res.status(500).json({ error: "Erreur lors de la suppression du médecin" });
    }
  });
  router.put('/updateDoctor/:id', uploaddc.single('image'), (req, res) => {
    const doctorId = req.params.id;  // ID du médecin à mettre à jour
    const { name, lastname, email, specialty, password } = req.body;

    // Vérification des champs requis
    if (![name, lastname, email, specialty].every(Boolean)) {
        return res.json({ status: 'failed', message: 'Please fill all the fields' });
    }

    // Validation de l'email
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
        return res.json({ status: 'failed', message: 'Invalid email address' });
    }

    // Trouver le médecin à mettre à jour
    User.findById(doctorId).then(existingDoctor => {
        if (!existingDoctor) {
            return res.json({ status: 'failed', message: 'Doctor not found' });
        }

        // Vérifier si la spécialité existe
        Specialite.findById(specialty).then(specialtyDoc => {
            if (!specialtyDoc) {
                return res.json({ status: 'failed', message: 'Specialty not found' });
            }

            // Hachage du mot de passe (uniquement si un nouveau mot de passe est fourni)
            const updateData = {
                name,
                lastname,
                specialty: specialtyDoc._id,
                email,
                role: 'doctor',  // Rôle par défaut
                creationDate: existingDoctor.creationDate, // Garder la date de création existante
            };

            // Si un mot de passe est fourni, on le hache et on le met à jour
            if (password) {
                bcrypt.hash(password, 10).then(hashedPassword => {
                    updateData.password = hashedPassword;
                }).catch(err => {
                    console.error('Erreur lors du hachage du mot de passe', err);
                    return res.json({ status: 'failed', message: 'Error hashing password' });
                });
            }

            // Si une nouvelle image est envoyée, mettre à jour l'image
            if (req.file) {
                updateData.image = req.file.filename;
            }

            // Mettre à jour le médecin dans la base de données
            User.findByIdAndUpdate(doctorId, updateData, { new: true })
                .then(updatedDoctor => {
                    res.json({ status: 'success', message: 'Doctor updated successfully', user: updatedDoctor });
                })
                .catch(err => {
                    console.error('Erreur lors de la mise à jour du médecin:', err);
                    res.json({ status: 'failed', message: 'Error updating doctor' });
                });
        }).catch(err => {
            console.error('Erreur de base de données lors de la recherche de spécialité', err);
            res.json({ status: 'failed', message: 'Database error' });
        });
    }).catch(err => {
        console.error('Erreur de base de données lors de la recherche du médecin', err);
        res.json({ status: 'failed', message: 'Database error' });
    });
});


router.get("/getDoctor/:id", async (req, res) => {
    try {
        const doctorId = req.params.id;
        const doctor = await User.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ error: "Médecin non trouvé" });
        }

        res.status(200).json(doctor);
    } catch (error) {
        console.error("Erreur lors de la récupération du médecin:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du médecin" });
    }
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3001/');
  }
);
// Route to start the Facebook authentication process
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Route to handle the callback after successful or failed authentication
router.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/signin' }),
    (req, res) => {
        // Successful authentication, redirect to home or dashboard
        res.redirect('http://localhost:3001/');
    });
router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
});
module.exports = router;
