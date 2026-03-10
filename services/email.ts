
import { getAdminConfig } from './storage';

/**
 * Sends an email using SendGrid (Simulated for Frontend-Only)
 * 
 * NOTE: In a real production app, you CANNOT call SendGrid API directly from the browser
 * due to CORS and Security risks (exposing API Key). 
 * This service mimics the backend logic that would handle the request.
 */
const sendEmail = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
  const config = getAdminConfig();

  if (!config.sendGridApiKey) {
    console.warn("⚠️ Email Service: SendGrid API Key is missing in Admin Settings. Email not sent.");
    return false;
  }

  const fromEmail = config.sendGridFromEmail || 'noreply@safedatecheck.com';

  console.group("📧 [Mock SendGrid Dispatch]");
  console.log("API Key:", config.sendGridApiKey ? "********" : "Missing");
  console.log("From:", fromEmail);
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Content Preview:", htmlContent.substring(0, 100) + "...");
  console.groupEnd();

  // Simulate Network Delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return true to simulate success
  return true;
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const config = getAdminConfig();
  const resetLink = `${window.location.origin}/?reset_token=${resetToken}`;
  const appName = "SafeDate Check";

  // Use configured template or fallback logic (fallback already handled in storage, but safe guard here)
  let subject = config.passwordResetEmailSubject || "Reset Your SafeDate Check Password";
  let html = config.passwordResetEmailBody || `
    <p>Click the link below to set a new password:</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
  `;

  // Replace Shortcodes
  html = html.replace(/{reset_link}/g, resetLink);
  html = html.replace(/{user_email}/g, email);
  html = html.replace(/{app_name}/g, appName);
  
  // Simple Subject replacement if needed
  subject = subject.replace(/{app_name}/g, appName);

  return await sendEmail(email, subject, html);
};

export const sendInviteEmail = async (email: string, inviteCode: string) => {
  const inviteLink = `${window.location.origin}/?invite=${inviteCode}`;
  
  const subject = "You've been invited to SafeDate Check";
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>You're Invited!</h2>
      <p>You have been granted 30 days of free Premium access to SafeDate Check.</p>
      <p><strong>Your Invite Code:</strong> ${inviteCode}</p>
      <p>Click below to redeem your access:</p>
      <a href="${inviteLink}" style="background: #0d9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
    </div>
  `;

  return await sendEmail(email, subject, html);
};
