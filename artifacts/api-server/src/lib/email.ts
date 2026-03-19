const NOTIFY_EMAIL = "fdangelo8@gmail.com";
const FROM_EMAIL = "PartyNest <onboarding@resend.dev>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const { Resend } = require("resend");
  return new Resend(apiKey);
}

export async function sendBookingEmail(booking: {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  businessName: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  childrenAge?: string;
  notes?: string;
  totalPrice?: number;
  packageName?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("RESEND_API_KEY not set, skipping booking email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: "prenotazione",
      html: `
        <h2>Nuova Prenotazione - PartyNest</h2>
        <p><strong>Nome Genitore:</strong> ${booking.parentName}</p>
        <p><strong>Email:</strong> ${booking.parentEmail}</p>
        <p><strong>Telefono:</strong> ${booking.parentPhone}</p>
        <p><strong>Location:</strong> ${booking.businessName}</p>
        <p><strong>Data:</strong> ${booking.date}</p>
        <p><strong>Fascia oraria:</strong> ${booking.timeSlot}</p>
        <p><strong>Numero ospiti:</strong> ${booking.guestCount}</p>
        ${booking.childrenAge ? `<p><strong>Età bambini:</strong> ${booking.childrenAge}</p>` : ""}
        ${booking.packageName ? `<p><strong>Pacchetto:</strong> ${booking.packageName}</p>` : ""}
        ${booking.totalPrice ? `<p><strong>Prezzo totale:</strong> €${booking.totalPrice}</p>` : ""}
        ${booking.notes ? `<p><strong>Note:</strong> ${booking.notes}</p>` : ""}
      `,
    });
  } catch (err) {
    console.error("Booking email send error:", err);
  }
}

export async function sendQuoteEmail(quote: {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  eventDate?: string;
  guestCount: number;
  childrenAge?: string;
  message?: string;
  services?: string[];
}) {
  const resend = getResend();
  if (!resend) {
    console.log("RESEND_API_KEY not set, skipping quote email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: "preventivo",
      html: `
        <h2>Nuova Richiesta Preventivo - PartyNest</h2>
        <p><strong>Nome:</strong> ${quote.name}</p>
        <p><strong>Email:</strong> ${quote.email}</p>
        ${quote.phone ? `<p><strong>Telefono:</strong> ${quote.phone}</p>` : ""}
        <p><strong>Location:</strong> ${quote.businessName}</p>
        ${quote.eventDate ? `<p><strong>Data evento:</strong> ${quote.eventDate}</p>` : ""}
        <p><strong>Numero ospiti:</strong> ${quote.guestCount}</p>
        ${quote.childrenAge ? `<p><strong>Età bambini:</strong> ${quote.childrenAge}</p>` : ""}
        ${quote.services?.length ? `<p><strong>Servizi richiesti:</strong> ${quote.services.join(", ")}</p>` : ""}
        ${quote.message ? `<p><strong>Messaggio:</strong> ${quote.message}</p>` : ""}
      `,
    });
  } catch (err) {
    console.error("Quote email send error:", err);
  }
}
