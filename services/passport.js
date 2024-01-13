const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        return done(null, existingUser);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash((+new Date * Math.random()).toString(36).substring(0,6), salt);

      const user = await new User({
        email: profile.emails[0].value,
        username: profile.name.familyName + ' ' + profile.name.givenName,
        password: hashedPass,
      }).save();

      done(null, user);
    })
);

passport.use(
  new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      proxy: true,
      profileFields: ['id', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);

      const existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        return done(null, existingUser);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash((+new Date * Math.random()).toString(36).substring(0,6), salt);

      const user = await new User({
        email: profile.emails[0].value,
        username: profile.name.familyName + ' ' + profile.name.givenName,
        password: hashedPass,
      }).save();

      done(null, '');
    })
);