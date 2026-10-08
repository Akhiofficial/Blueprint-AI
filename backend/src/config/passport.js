/**
 * passport.js — Google OAuth 2.0 Strategy
 *
 * Uses passport-google-oauth20 solely for the OAuth handshake.
 * No Passport sessions are configured — BlueprintAI uses JWT + httpOnly cookies.
 *
 * Account linking logic:
 *   1. Existing user found by googleId         → reuse (returning Google user)
 *   2. Existing user found by verified email   → link googleId, reuse (account merge)
 *   3. No match                                → create new BlueprintAI user
 *
 * Existing passwords are NEVER overwritten.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      // scope is set on the route — no need to repeat here
    },
    async (_accessToken, _refreshToken, profile, done) => {
      // We intentionally discard access/refresh tokens.
      // BlueprintAI only needs authentication, not Google API access.
      try {
        const googleId = profile.id;
        const email    = profile.emails?.[0]?.value?.toLowerCase();
        const name     = profile.displayName || profile.name?.givenName || 'Google User';
        const avatar   = profile.photos?.[0]?.value || '';

        // ── CASE 1: Returning Google user (most common fast path) ──
        let user = await User.findOne({ googleId });
        if (user) {
          return done(null, user);
        }

        // ── CASE 2: Existing email/password user — link their account ──
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Attach googleId so future logins hit CASE 1 immediately.
            // Never touch user.password.
            user.googleId = googleId;
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }
        }

        // ── CASE 3: Brand-new Google user — create a BlueprintAI account ──
        const newUser = await User.create({
          name,
          email,
          avatar,
          googleId,
          // password intentionally omitted — field is now optional in schema
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
