import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      const user = users[0];
      if (!user) {
        return done(null, false, { message: "Email o password non corretti" });
      }
      if (!user.passwordHash) {
        return done(null, false, { message: "Accedi con Google" });
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return done(null, false, { message: "Email o password non corretti" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
    `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false);
          }

          const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

          if (existing[0]) {
            if (!existing[0].googleId) {
              await db.update(usersTable)
                .set({ googleId: profile.id, updatedAt: new Date() })
                .where(eq(usersTable.id, existing[0].id));
            }
            return done(null, existing[0]);
          }

          const [user] = await db.insert(usersTable).values({
            email,
            name: profile.displayName || email.split("@")[0],
            role: "parent",
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          }).returning();

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    done(null, users[0] || null);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
