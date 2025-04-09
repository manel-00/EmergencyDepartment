const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User'); 
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/user/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
          if (!user.googleId) {
              // Associe l'ID Google s'il n'est pas déjà enregistré
              user.googleId = profile.id;
              await user.save();
          }
          console.log("✅ Utilisateur Google connecté :", user);
          return done(null, user);
      }

      // Si l'utilisateur n'existe pas, on le crée
      const newUser = new User({
          googleId: profile.id,
          name: profile.name.givenName || profile.displayName,
          lastname: profile.name.familyName || '',
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          verified: true, // Google vérifie automatiquement l'email
          role: 'user'
      });

      user = await newUser.save();
      console.log("✅ Nouvel utilisateur Google enregistré :", user);
      return done(null, user);
  } catch (err) {
      console.error("❌ Erreur Google OAuth :", err);
      return done(err);
  }
}
));


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/user/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'name', 'emails', 'photos']
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails ? profile.emails[0].value : null });

        if (user) {
            if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save();
            }
            console.log("✅ Utilisateur Facebook connecté :", user);
            return done(null, user);
        }

        // Si l'utilisateur n'existe pas, on le crée
        const newUser = new User({
            facebookId: profile.id,
            name: profile.name.givenName || profile.displayName,
            lastname: profile.name.familyName || '',
            email: profile.emails ? profile.emails[0].value : '',
            image: profile.photos ? profile.photos[0].value : '',
            verified: true,
            role: 'user'
        });

        user = await newUser.save();
        console.log("✅ Nouvel utilisateur Facebook enregistré :", user);
        return done(null, user);
    } catch (err) {
        console.error("❌ Erreur Facebook OAuth :", err);
        return done(err);
    }
}));
// Serialize user (enregistre l'ID utilisateur dans la session)
passport.serializeUser((user, done) => {
    console.log("🔹 Sérialisation de l'utilisateur :", user); // Affiche l'utilisateur dans la console
    done(null, user._id); // Utilise _id au lieu de id
});

// Deserialize user (récupère l'utilisateur depuis la session)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        console.log("🔹 Désérialisation de l'utilisateur :", user); // Affiche l'utilisateur récupéré
        done(null, user);
    } catch (err) {
        console.error("❌ Erreur de désérialisation :", err);
        done(err);
    }
});

module.exports = passport;