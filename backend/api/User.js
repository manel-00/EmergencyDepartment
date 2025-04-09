const express = require('express');
const session = require("express-session");
const router = express.Router();
const User = require('../models/User');
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

const Specialite = require('../models/Specialite');
require('../config/passport');
const FACE_API_KEY = "YXS8_nKXO7PSlrlnm_9d_DNqTt_xdPRJ";
const FACE_API_SECRET = "PWPcORmhNazihOEldMvGKu6yr_5NisrL";
const FACEPP_DETECT_URL = "https://api-us.faceplusplus.com/facepp/v3/detect";
const FACEPP_COMPARE_URL = "https://api-us.faceplusplus.com/facepp/v3/compare";
const FormData = require("form-data");
const fs = require('fs');
const jwt = require("jsonwebtoken");
const axios = require("axios");

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
        'C:/Users/Manel/Downloads/2nd template/frontend/public/images'

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
        'C:/Users/Manel/Downloads/2nd template/backoffice/public/images'
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
  router.post('/signup', upload.single('image'), async (req, res) => {
    try {
        const { name, lastname, email, password, role, creationDate } = req.body;

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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ status: 'failed', message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const imageBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });

        // 🔹 Envoyer l’image à Face++ pour obtenir un faceToken
        const formData = new FormData();
        formData.append("api_key", FACE_API_KEY);
        formData.append("api_secret", FACE_API_SECRET);
        formData.append("image_base64", imageBase64);

        const faceResponse = await axios.post(FACEPP_DETECT_URL, formData, {
            headers: formData.getHeaders(),
        });

        if (!faceResponse.data.faces || faceResponse.data.faces.length === 0) {
            return res.status(400).json({ status: "failed", message: "No face detected in the image" });
        }

        const faceToken = faceResponse.data.faces[0].face_token;

        const newUser = new User({
            name,
            lastname,
            role,
            email,
            password: hashedPassword,
            creationDate: new Date(creationDate),
            verified: false,
            image: req.file.filename,
            faceToken // 🔹 Enregistrer le faceToken
        });
        console.log("newuser<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,",newUser);

        await newUser.save();
        sendVerificationEmail(newUser, res);

    } catch (error) {
        console.error("Error during signup:", error);
        res.json({ status: "failed", message: "Error saving user" });
    }
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

      // Vérification de l'OTP existant
      const otpRecord = await UserOTPVerification.findOne({ userId: user._id });

      if (otpRecord && otpRecord.expiresAt > Date.now()) {
          // OTP valide déjà envoyé, renvoyer le statut
          return res.json({ status: "PENDING", message: "OTP already sent to email", data: { userId: user._id, email: user.email } });
      } else {
          // Pas d'OTP valide ou OTP expiré, envoyer un nouvel OTP
          return sendOTPVerificationEmail({ _id: user._id, email: user.email }, res);
      }
  } catch (error) {
      console.error("❌ Error during signin:", error);
      res.json({ status: "failed", message: "Error during signin" });
  }
});

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
          await UserOTPVerification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
      }

      const validOTP = await bcrypt.compare(otp, hashedOTP);
      if (!validOTP) {
          throw new Error("Invalid code passed. Check your inbox.");
      }

      // ✅ OTP is valid, update the user's verification status
      await User.updateOne({ _id: userId }, { verified: true });
      await UserOTPVerification.deleteMany({ userId });

      // ✅ Fetch user details
      const user = await User.findById(userId);
      if (!user) {
          throw new Error("User not found");
      }

      // ✅ Generate JWT Token (valid for 7 days)
      const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" } 
      );

      // ✅ Store user session for session-based authentication
      req.session.user = {
          userId: user._id,
          email: user.email,
          role: user.role,
          image: user.image || null,  // ✅ Ensure user image is included
      };

      console.log("✅ Session after OTP verification:", req.session); // Debugging purpose

      // ✅ Set the JWT token in an HTTP-only cookie
      res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // ✅ Return success response with JWT token
      res.json({
          status: "SUCCESS",
          message: "OTP verified successfully",
          token, 
          user: {
              userId: user._id,
              email: user.email,
              role: user.role,
              image: user.image || null,
          },
      });
      
  } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      res.status(400).json({
          status: "FAILED",
          message: error.message,
      });
  }
});
  


// ✅ Ensure session-based authentication
router.get("/session", async (req, res) => {
  try {
    // 🔐 Vérifie la session d'abord
    if (req.session?.user) {
      console.log("✅ Session exists:", req.session.user.email);

      const user = await User.findById(req.session.user._id || req.session.user.userId).select("-password");
      if (!user) {
        return res.status(404).json({ status: "FAILED", message: "User not found in DB" });
      }

      return res.json({
        status: "SUCCESS",
        user: {
          userId: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      });
    }

    // 🔐 Sinon, vérifie le token JWT
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("❌ No session and no token found.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("❌ User not found.");
      return res.status(401).json({ status: "FAILED", message: "User not found" });
    }

    console.log("✅ JWT Session exists for user:", user.email);

    return res.json({
      status: "SUCCESS",
      user: {
        userId: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });

  } catch (error) {
    console.error("❌ Session retrieval failed:", error);
    return res.status(500).json({ status: "FAILED", message: "Session retrieval failed" });
  }
});







router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: "FAILED",
        message: "Error while destroying session",
      });
    }

    // ✅ Supprimer connect.sid
    res.clearCookie("connect.sid", {
      path: "/",
    });

    // ✅ Supprimer JWT
    res.cookie("token", "", {
      httpOnly: true,
      secure: false,         // ⛔ doit correspondre à la création
      sameSite: "Lax",
      path: "/",             // ✅ doit correspondre à la création
      expires: new Date(0),  // ✅ force expiration
    });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Logged out, all cookies cleared",
    });
  });
});




router.put("/edit-profile", upload.single("image"), async (req, res) => {
  try {
    
    const { name } = req.body;
    const userId = req.session.user?.userId; // Ensure session userId is set

    if (!userId) {
      return res.status(401).json({ status: "FAILED", message: "Unauthorized" });
    }

    let updateData = { name };
    
    // ✅ Check if an image was uploaded
    if (req.file) {
      updateData.image = req.file.filename; // Save only the filename
    }

    // ✅ Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ status: "FAILED", message: "User not found" });
    }

    res.json({ status: "SUCCESS", user: updatedUser });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ status: "FAILED", message: "Server error" });
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
router.post("/resetPassword", async (req, res) => {
    const { userId, resetString, newPassword } = req.body;

    console.log("Received reset request for userId:", userId);
    console.log("Received resetString:", resetString);

    try {
        const record = await PasswordReset.findOne({ userId });

        if (!record) {
            console.error("Password reset request not found for userId:", userId);
            return res.status(404).json({ status: "FAILED", message: "Password reset request not found." });
        }

        const { expiredAt, resetString: storedHash } = record;

        console.log("Stored hashed resetString:", storedHash);

        if (expiredAt < Date.now()) {
            await PasswordReset.deleteOne({ userId });
            return res.status(400).json({ status: "FAILED", message: "Password reset request has expired. Please request again." });
        }

        const isMatch = await bcrypt.compare(resetString, storedHash);
        console.log("Reset string match result:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ status: "FAILED", message: "Invalid password reset request" });
        }

        // Hash du nouveau mot de passe
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Mise à jour du mot de passe utilisateur
        await User.updateOne({ _id: userId }, { password: hashedNewPassword });

        // Suppression de la demande de reset
        await PasswordReset.deleteOne({ userId });

        res.json({ status: "SUCCESS", message: "Password reset successfully" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ status: "FAILED", message: "Server error" });
    }
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

// Après succès Google
// ✅ Lance l'authentification Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ✅ Callback après succès
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    const token = generateJWT(req.user._id); // à adapter selon ta logique
    res.redirect(`http://localhost:3001/oauth-success?token=${token}`);
  }
);

// ✅ Facebook
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  (req, res) => {
    const token = generateJWT(req.user._id);
    res.redirect(`http://localhost:3001/oauth-success?token=${token}`);
  }
);

router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
});
//
function generateJWT(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d' // ou '1h', '30m', etc.
  });
}


router.post("/face-login", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const imageBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });

    const formData = new FormData();
    formData.append("api_key", FACE_API_KEY);
    formData.append("api_secret", FACE_API_SECRET);
    formData.append("image_base64", imageBase64);

    const detectResponse = await axios.post(FACEPP_DETECT_URL, formData, {
      headers: formData.getHeaders(),
    });

    if (!detectResponse.data.faces || detectResponse.data.faces.length === 0) {
      return res.status(400).json({ message: "No face detected" });
    }

    const capturedFaceToken = detectResponse.data.faces[0].face_token;

    const users = await User.find({ faceToken: { $exists: true } });

    for (const user of users) {
      const compareForm = new FormData();
      compareForm.append("api_key", FACE_API_KEY);
      compareForm.append("api_secret", FACE_API_SECRET);
      compareForm.append("face_token1", user.faceToken);
      compareForm.append("face_token2", capturedFaceToken);

      const compareResponse = await axios.post(FACEPP_COMPARE_URL, compareForm, {
        headers: compareForm.getHeaders(),
      });

      if (compareResponse.data.confidence >= 75) {
        // ✅ Store user session
        req.session.user = {
          userId: user._id,
          email: user.email,
          role: user.role,
          image: user.image || null,
        };

        console.log("✅ Session Stored After Face Login:", req.session.user);

        // ✅ Generate JWT Token
        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // ✅ Set JWT Token in an HTTP-Only Cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({
          status: "SUCCESS",
          message: "Face login successful",
          token, // Return JWT token
          user: {
            userId: user._id,
            email: user.email,
            role: user.role,
            image: user.image || null,
          },
        });
      }
    }

    return res.status(401).json({ message: "Face mismatch, login failed" });
  } catch (error) {
    console.error("❌ Face login failed:", error);
    return res.status(500).json({ message: "Face login failed", error: error.message });
  } finally {
    if (req.file) fs.unlink(req.file.path, (err) => err && console.error(err));
  }
});





router.put("/edit-profile", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.file) user.image = req.file.filename; // Save the image filename

    await user.save();
    return res.json({ status: "SUCCESS", user });

  } catch (error) {
    console.error("❌ Edit Profile Failed:", error);
    return res.status(500).json({ message: "Profile update failed", error: error.message });
  }
});


router.get('/listPatients', async (req, res) => {
  try {
    // On récupère les utilisateurs avec le rôle 'patient' et on exclut le champ 'image'
    const patients = await User.find({ role: 'patient' }).select('-image'); 

    // Si tout se passe bien, on renvoie les patients
    res.status(200).json(patients);
  } catch (error) {
    console.error('Erreur lors de la récupération des patients :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});




//rassil modified 

  router.get('/listPatientsrassil', async (req, res) => {
    try {
      let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      console.log("❌ No session and no token found.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded",decoded);
    if(!decoded){
      console.log("❌ decoded not valid.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }
    if(decoded.role ==="doctor" || decoded.role === "admin"){
         // On récupère les utilisateurs avec le rôle 'patient' et on exclut le champ 'image'
         const patients = await User.find({ role: 'patient' }).select('-image'); 
  
         // Si tout se passe bien, on renvoie les patients
         res.status(200).json(patients);
    }else{
      return res.status(401).json({ status: "FAILED", message: "wrong user" });
    }
   
    
    } catch (error) {
      console.error('Erreur lors de la récupération des patients :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });


  router.delete('/deletePatient/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
      // Trouver et supprimer le patient dans la base de données
      const deletedPatient = await User.findByIdAndDelete(id);
  
      if (!deletedPatient) {
        return res.status(404).json({ message: 'Patient non trouvé' });
      }
  
      res.status(200).json({ message: 'Patient supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  });  

// rassil added 
// PUT /user/update/:id
router.put("/update/:id", async (req, res) => {
  const { name, lastname } = req.body;

  try {
    await User.findByIdAndUpdate(req.params.id, { name, lastname });
    res.json({ status: "SUCCESS", message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ status: "FAILED", message: "Update failed" });
  }
});

//rassil added
router.get('/:id/image-filename', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('image -_id'); // Only returns the image field
    console.log(user,"user<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    // Check if user and image exist
     console.log(user.image,"user.image<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    
    if (!user || !user.image) {
      return res.status(404).json({ 
        status: 'FAILED', 
        message: 'User or image not found' 
      });
    }

    // Return just the filename string
    res.json({ 
      status: 'SUCCESS',
      imageFilename: user.image 
    });

  } catch (error) {
    console.error('❌ Error fetching image filename:', error);
    res.status(500).json({ 
      status: 'FAILED',
      message: 'Server error' 
    });
  }
});
//rassil added
router.get("/getUser/:id", async (req, res) => {
  try {
    // Get token from cookies or authorization header
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      console.log("❌ No session and no token found.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    
    if (!decoded) {
      console.log("❌ decoded not valid.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }
    
    // Get userId from params
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password"); // Exclude password for security

    if (!user) {
      return res.status(404).json({ 
        status: "FAILED", 
        message: "User not found" 
      });
    }

    res.status(200).json({
      status: "SUCCESS",
      user: {
        userId: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        image: user.image,
        verified: user.verified,
        creationDate: user.creationDate,
        specialty: user.specialty // Include if needed
      }
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    
    // Check if error is due to JWT verification
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "FAILED",
        message: "Invalid token"
      });
    }
    
    // Check if error is due to expired token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "FAILED",
        message: "Token expired"
      });
    }
    
    // Check if error is due to invalid ID format
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ 
        status: "FAILED", 
        message: "Invalid user ID format" 
      });
    }
    
    res.status(500).json({ 
      status: "FAILED", 
      message: "Server error while fetching user" 
    });
  }
});

module.exports = router;
