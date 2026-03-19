import { Router } from "express";
import { db, bookingsTable, businessesTable, packagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateBookingBody, UpdateBookingStatusBody } from "@workspace/api-zod";
import { sendBookingEmail } from "../lib/email.js";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

async function enrichBooking(booking: any) {
  const business = booking.businessId
    ? (await db.select().from(businessesTable).where(eq(businessesTable.id, booking.businessId)).limit(1))[0]
    : null;
  const pkg = booking.packageId
    ? (await db.select().from(packagesTable).where(eq(packagesTable.id, booking.packageId)).limit(1))[0]
    : null;
  return { ...booking, business, package: pkg };
}

router.get("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { businessId, status } = req.query;

  let bookings;
  if (businessId) {
    const business = await db.select().from(businessesTable).where(eq(businessesTable.id, businessId as string)).limit(1);
    if (!business[0] || business[0].ownerId !== user.id) {
      return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
    }
    const conditions: any[] = [eq(bookingsTable.businessId, businessId as string)];
    if (status) conditions.push(eq(bookingsTable.status, status as any));
    bookings = await db.select().from(bookingsTable).where(and(...conditions));
  } else {
    const conditions: any[] = [eq(bookingsTable.userId, user.id)];
    if (status) conditions.push(eq(bookingsTable.status, status as any));
    bookings = await db.select().from(bookingsTable).where(and(...conditions));
  }

  const enriched = await Promise.all(bookings.map(enrichBooking));
  res.json(enriched);
});

router.post("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const [booking] = await db.insert(bookingsTable).values({
    ...parsed.data,
    userId: user.id,
    status: "pending",
  }).returning();

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, booking.businessId)).limit(1);
  const pkg = booking.packageId
    ? (await db.select().from(packagesTable).where(eq(packagesTable.id, booking.packageId)).limit(1))[0]
    : null;

  sendBookingEmail({
    parentName: booking.parentName,
    parentEmail: booking.parentEmail,
    parentPhone: booking.parentPhone,
    businessName: business[0]?.name ?? "N/A",
    date: booking.date,
    timeSlot: booking.timeSlot,
    guestCount: booking.guestCount,
    childrenAge: booking.childrenAge ?? undefined,
    notes: booking.notes ?? undefined,
    totalPrice: booking.totalPrice ?? undefined,
    packageName: pkg?.name ?? undefined,
  });

  res.status(201).json({ ...booking, business: business[0], package: pkg });
});

router.get("/:id", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { id } = req.params;

  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!bookings[0]) return res.status(404).json({ error: "not_found", message: "Prenotazione non trovata" });

  const booking = bookings[0];
  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, booking.businessId)).limit(1);

  const isOwner = booking.userId === user.id;
  const isBusinessOwner = business[0]?.ownerId === user.id;
  if (!isOwner && !isBusinessOwner) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  res.json(await enrichBooking(booking));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { id } = req.params;
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!bookings[0]) return res.status(404).json({ error: "not_found", message: "Prenotazione non trovata" });

  const booking = bookings[0];
  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, booking.businessId)).limit(1);

  const isOwner = booking.userId === user.id;
  const isBusinessOwner = business[0]?.ownerId === user.id;

  if (parsed.data.status === "cancelled" && !isOwner && !isBusinessOwner) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }
  if ((parsed.data.status === "accepted" || parsed.data.status === "rejected") && !isBusinessOwner) {
    return res.status(403).json({ error: "forbidden", message: "Solo il proprietario può accettare/rifiutare" });
  }

  const [updated] = await db.update(bookingsTable)
    .set({ status: parsed.data.status, statusNote: parsed.data.note ?? null, updatedAt: new Date() })
    .where(eq(bookingsTable.id, id))
    .returning();

  res.json(await enrichBooking(updated));
});

export default router;
