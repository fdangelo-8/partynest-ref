import { Router } from "express";
import { db, quotesTable, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateQuoteBody } from "@workspace/api-zod";
import { sendQuoteEmail } from "../lib/email.js";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

router.post("/", async (req, res) => {
  const parsed = CreateQuoteBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const user = req.user as any;

  const [quote] = await db.insert(quotesTable).values({
    ...parsed.data,
    userId: user?.id ?? null,
    status: "pending",
  }).returning();

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, quote.businessId)).limit(1);

  sendQuoteEmail({
    name: quote.name,
    email: quote.email,
    phone: quote.phone ?? undefined,
    businessName: business[0]?.name ?? "N/A",
    eventDate: quote.eventDate ?? undefined,
    guestCount: quote.guestCount,
    childrenAge: quote.childrenAge ?? undefined,
    message: quote.message ?? undefined,
    services: quote.services ?? [],
  });

  res.status(201).json({ ...quote, business: business[0] });
});

router.get("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { businessId } = req.query;

  if (!businessId) return res.status(400).json({ error: "validation", message: "businessId richiesto" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, businessId as string)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const quotes = await db.select().from(quotesTable).where(eq(quotesTable.businessId, businessId as string));
  const enriched = quotes.map(q => ({ ...q, business: business[0] }));
  res.json(enriched);
});

export default router;
