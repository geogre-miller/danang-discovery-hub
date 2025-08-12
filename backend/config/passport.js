const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET || "your_jwt_secret";

module.exports = (passport) => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    })
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              return done(null, user);
            }

            // Create new user
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos[0].value,
            });

            await user.save();
            return done(null, user);
          } catch (err) {
            console.error(err);
            return done(err, false);
          }
        }
      )
    );
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ["id", "displayName", "photos", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await User.findOne({ facebookId: profile.id });

            if (user) {
              return done(null, user);
            }

            // Create new user if email exists
            if (profile.emails && profile.emails[0].value) {
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                facebookId: profile.id,
                avatar: profile.photos[0].value,
              });

              await user.save();
              return done(null, user);
            } else {
              return done(
                new Error("Facebook authentication requires email permission"),
                false
              );
            }
          } catch (err) {
            console.error(err);
            return done(err, false);
          }
        }
      )
    );
  }

  // Serialization and Deserialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
