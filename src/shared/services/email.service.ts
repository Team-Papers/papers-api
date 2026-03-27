import { Resend } from 'resend';
import { env } from '../../config/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const from = env.EMAIL_FROM || 'Papers <noreply@papers.app>';

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn('[Email] Resend not configured, skipping email to:', to);
    return;
  }
  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = env.APP_BASE_URL || 'https://papers237.duckdns.org';
  const link = `${baseUrl}/verify-email?token=${token}`;
  await sendEmail(
    to,
    'Vérifiez votre adresse email — Papers',
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #00B4D8; font-size: 28px; margin-bottom: 8px;">Papers</h1>
      <h2 style="color: #333; font-size: 20px;">Confirmez votre adresse email</h2>
      <p style="color: #666; line-height: 1.6;">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte.</p>
      <a href="${link}" style="display: inline-block; background: #00B4D8; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Vérifier mon email</a>
      <p style="color: #999; font-size: 13px;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  `,
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = env.APP_BASE_URL || 'https://papers237.duckdns.org';
  const link = `${baseUrl}/reset-password?token=${token}`;
  await sendEmail(
    to,
    'Réinitialisation de mot de passe — Papers',
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #00B4D8; font-size: 28px; margin-bottom: 8px;">Papers</h1>
      <h2 style="color: #333; font-size: 20px;">Réinitialisation de mot de passe</h2>
      <p style="color: #666; line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous.</p>
      <a href="${link}" style="display: inline-block; background: #00B4D8; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Réinitialiser mon mot de passe</a>
      <p style="color: #999; font-size: 13px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    </div>
  `,
  );
}

export async function sendAuthorApprovedEmail(to: string, penName: string) {
  await sendEmail(
    to,
    'Votre demande auteur a été approuvée — Papers',
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #00B4D8; font-size: 28px; margin-bottom: 8px;">Papers</h1>
      <h2 style="color: #333; font-size: 20px;">Félicitations, ${penName} ! 🎉</h2>
      <p style="color: #666; line-height: 1.6;">Votre demande de statut auteur a été approuvée. Vous pouvez maintenant publier vos livres sur Papers.</p>
      <p style="color: #999; font-size: 13px;">L'équipe Papers</p>
    </div>
  `,
  );
}

export async function sendNewSaleEmail(to: string, bookTitle: string, amount: number) {
  await sendEmail(
    to,
    `Nouvelle vente : ${bookTitle} — Papers`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #00B4D8; font-size: 28px; margin-bottom: 8px;">Papers</h1>
      <h2 style="color: #333; font-size: 20px;">Vous avez une nouvelle vente !</h2>
      <p style="color: #666; line-height: 1.6;">Votre livre <strong>${bookTitle}</strong> vient d'être acheté. Vous avez gagné <strong>${amount} FCFA</strong>.</p>
      <p style="color: #999; font-size: 13px;">L'équipe Papers</p>
    </div>
  `,
  );
}

export const emailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAuthorApprovedEmail,
  sendNewSaleEmail,
};
