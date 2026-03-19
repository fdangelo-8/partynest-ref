import { Router } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody } from "@workspace/api-zod";

const router = Router();

router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation", message: "Dati non validi" });
  }

  const { email, password, name, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "duplicate", message: "Email già registrata" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    role: role as "parent" | "business",
  }).returning();

  req.login(user, (err) => {
    if (err) return res.status(500).json({ error: "session", message: "Errore sessione" });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      message: "Registrazione completata",
    });
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "auth", message: info?.message || "Credenziali non valide" });

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        message: "Login effettuato",
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: "Logout effettuato" });
  });
});

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  }
  const user = req.user as any;
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: "not_configured",
      message: "Login Google non ancora configurato. Usa email e password.",
    });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect("/?error=google_not_configured");
  }
  passport.authenticate("google", { failureRedirect: "/auth/login?error=google_failed" })(req, res, (err: any) => {
    if (err) return next(err);
    const user = req.user as any;
    if (user?.role === "business") {
      return res.redirect("/crm/dashboard");
    }
    return res.redirect("/");
  });
});

export default router;
