import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../Models/user.model.js";

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const fullName = profile.displayName || "Google User";
          const profileImage = profile.photos?.[0]?.value || null;

          if (!email) {
            return done(new Error("Google email not found"), null);
          }

          let user = await User.findOne({ email });

    
          if (!user) {
            let baseUsername = email.split("@")[0].toLowerCase();
            let username = baseUsername;

        
            const exists = await User.findOne({ username });
            if (exists) username = baseUsername + Math.floor(Math.random() * 10000);

            user = await User.create({
              fullName,
              username,
              email,
              password: "google_auth", 
              isVerified: true,
              profileImage,
              authProvider: "google",
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
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
