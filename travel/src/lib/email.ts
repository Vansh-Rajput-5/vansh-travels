import nodemailer from 'nodemailer';
import type { BookingDocument } from '@/db/schema';

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portValue = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !portValue || !user || !pass || !from) {
    return null;
  }

  const port = Number.parseInt(portValue, 10);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('SMTP_PORT must be a valid positive number');
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    user,
    pass,
    from,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
  }).format(date);
}

function bookingDetailsRows(booking: BookingDocument) {
  return [
    ['Booking ID', `#${booking.id}`],
    ['Customer Name', booking.name],
    ['Email', booking.email],
    ['Phone', booking.phone],
    ['Pickup', booking.pickup],
    ['Drop', booking.drop],
    ['Destination', booking.destination],
    ['Travel Date', formatDate(booking.travelDate)],
    ['Trip Days', `${booking.tripDays}`],
    ['Members', `${booking.members}`],
    ['Vehicle Type', booking.vehicleType],
    ['Distance', `${booking.distance} km`],
    ['Total Price', formatCurrency(booking.price)],
    ['Payment Status', booking.paymentStatus],
    ['Payment ID', booking.paymentId ?? 'Pending'],
  ];
}

function buildBookingEmailHtml(booking: BookingDocument) {
  const rows = bookingDetailsRows(booking)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px;border:1px solid #d1d5db;background:#f8fafc;font-weight:600;">${escapeHtml(label)}</td>
          <td style="padding:12px;border:1px solid #d1d5db;">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;">Your booking has been received</h2>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(booking.name)},</p>
      <p style="margin:0 0 24px;">
        Thank you for booking with Vansh Travels. Here are your booking details.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        ${rows}
      </table>
      <p style="margin:0 0 8px;">We will contact you shortly regarding your trip.</p>
      <p style="margin:0;">Regards,<br />Vansh Travels</p>
    </div>
  `;
}

function buildBookingEmailText(booking: BookingDocument) {
  const lines = bookingDetailsRows(booking).map(([label, value]) => `${label}: ${value}`);

  return [
    `Hi ${booking.name},`,
    '',
    'Thank you for booking with Vansh Travels. Here are your booking details:',
    '',
    ...lines,
    '',
    'We will contact you shortly regarding your trip.',
    '',
    'Regards,',
    'Vansh Travels',
  ].join('\n');
}

export async function sendBookingConfirmationEmail(booking: BookingDocument) {
  const config = getMailConfig();

  if (!config) {
    console.warn('Skipping booking confirmation email because SMTP settings are incomplete.');
    return { skipped: true as const };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: booking.email,
    subject: `Booking Confirmation #${booking.id} - Vansh Travels`,
    text: buildBookingEmailText(booking),
    html: buildBookingEmailHtml(booking),
  });

  return { skipped: false as const };
}
