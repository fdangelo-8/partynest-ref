import { Router } from "express";
import { db, messagesTable, bookingsTable, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

router.get("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { bookingId } = req.query;
  if (!bookingId) return res.status(400).json({ error: "validation", message: "bookingId richiesto" });

  const booking = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId as string)).limit(1);
  if (!booking[0]) return res.status(404).json({ error: "not_found", message: "Prenotazione non trovata" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, booking[0].businessId)).limit(1);
  const isOwner = booking[0].userId === user.id;
  const isBusinessOwner = business[0]?.ownerId === user.id;

  if (!isOwner && !isBusinessOwner) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const messages = await db.select().from(messagesTable)
    .where(eq(messagesTable.bookingId, bookingId as string));

  res.json(messages);
});

router.post("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const booking = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parsed.data.bookingId)).limit(1);
  if (!booking[0]) return res.status(404).json({ error: "not_found", message: "Prenotazione non trovata" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, booking[0].businessId)).limit(1);
  const isOwner = booking[0].userId === user.id;
  const isBusinessOwner = business[0]?.ownerId === user.id;

  if (!isOwner && !isBusinessOwner) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const [message] = await db.insert(messagesTable).values({
    bookingId: parsed.data.bookingId,
    senderId: user.id,
    senderName: user.name,
    senderRole: isBusinessOwner ? "business" : "parent",
    content: parsed.data.content,
  }).returning();

  res.status(201).json(message);
});

export default router;
