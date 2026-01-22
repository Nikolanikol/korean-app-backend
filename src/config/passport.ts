import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env.js';
import { pool } from './database.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;

        // Проверка email
        if (!email) {
          console.error('OAuth Error: No email provided by Google');
          return done(new Error('No email provided by Google'), undefined);
        }

        // Проверка displayName
        if (!displayName) {
          console.error('OAuth Error: No display name provided by Google');
          return done(new Error('No display name provided by Google'), undefined);
        }

        // Создаем или обновляем пользователя
        const result = await pool.query(
          `INSERT INTO users (email, display_name, avatar_url, provider)
           VALUES ($1, $2, $3, 'google')
           ON CONFLICT (email) 
           DO UPDATE SET 
             display_name = $2,
             avatar_url = $3,
             updated_at = NOW()
           RETURNING *`,
          [email, displayName, avatarUrl]
        );

        const user = result.rows[0];
        console.log('✅ OAuth Success: User authenticated:', email);
        done(null, user);
      } catch (error) {
        console.error('❌ OAuth Database Error:', error);
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;