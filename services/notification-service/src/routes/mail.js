const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

/**
 * Creates a reusable Gmail transporter.
 */
function createTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error('SMTP_USER and SMTP_PASS are not configured in .env');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });
}

// ─── POST /mail/send-otp ──────────────────────────────────────────────────────
// Sends a 6-digit OTP to the user's email on login.
router.post('/send-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: 'error', message: 'Email and OTP are required' });
        }

        const transporter = createTransporter();
        const smtpUser = process.env.SMTP_USER;

        await transporter.sendMail({
            from: `"Barangay 178 System" <${smtpUser}>`,
            to: email,
            subject: 'Your Login OTP - Barangay 178 System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #ea580c; font-size: 22px; margin: 0;">Barangay 178</h2>
                        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Safety Campaign Management System</p>
                    </div>
                    <p style="color: #111827; font-size: 15px;">Hello,</p>
                    <p style="color: #374151; font-size: 14px;">You requested to log in. Here is your One-Time Password:</p>
                    <div style="background: #fff7ed; border: 2px dashed #ea580c; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ea580c;">${otp}</span>
                    </div>
                    <p style="color: #6b7280; font-size: 13px;">⏰ This code is valid for <strong>2 minutes</strong>. Do not share it with anyone.</p>
                    <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City
                    </p>
                </div>
            `
        });

        console.log(`[mail] OTP email sent to ${email}`);
        return res.json({ status: 'success', message: 'OTP sent successfully' });

    } catch (error) {
        console.error('[mail] Error sending OTP:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send OTP email', error: error.message });
    }
});

// ─── POST /mail/send-welcome ─────────────────────────────────────────────────
// Sends a welcome + account activation reminder email after resident sign-up.
router.post('/send-welcome', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ status: 'error', message: 'Email and name are required' });
        }

        const transporter = createTransporter();
        const smtpUser = process.env.SMTP_USER;

        await transporter.sendMail({
            from: `"Barangay 178 System" <${smtpUser}>`,
            to: email,
            subject: 'Welcome to Barangay 178 — Please Verify Your Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #ea580c; font-size: 22px; margin: 0;">Welcome to Barangay 178!</h2>
                        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Safety Campaign Management System</p>
                    </div>

                    <p style="color: #111827; font-size: 15px;">Hello, <strong>${name}</strong>!</p>
                    <p style="color: #374151; font-size: 14px;">
                        Your resident account has been successfully created. You are now part of the Barangay 178 community.
                    </p>

                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #15803d; font-size: 14px; margin: 0; font-weight: bold;">✅ Account Created Successfully</p>
                        <p style="color: #166534; font-size: 13px; margin: 8px 0 0;">
                            Please check your email inbox for a separate <strong>confirmation link</strong> from Supabase 
                            to fully activate your account before logging in.
                        </p>
                    </div>

                    <p style="color: #374151; font-size: 14px;">Once verified, you will be able to:</p>
                    <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
                        <li>📢 Receive safety campaign announcements</li>
                        <li>🚨 Get emergency alerts via SMS</li>
                        <li>🔊 Access AI voice announcements</li>
                        <li>🗺️ View community updates</li>
                    </ul>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City<br>
                        If you did not create this account, please ignore this email.
                    </p>
                </div>
            `
        });

        console.log(`[mail] Welcome email sent to ${email}`);
        return res.json({ status: 'success', message: 'Welcome email sent successfully' });

    } catch (error) {
        console.error('[mail] Error sending welcome email:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send welcome email', error: error.message });
    }
});

// ─── POST /mail/send-campaign ─────────────────────────────────────────────────
// Sends a campaign notification email to multiple recipients.
router.post('/send-campaign', async (req, res) => {
    try {
        const { emails, campaign_title, campaign_message } = req.body;
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ status: 'error', message: 'emails array is required' });
        }
        if (!campaign_title) {
            return res.status(400).json({ status: 'error', message: 'campaign_title is required' });
        }

        const transporter = createTransporter();
        const smtpUser = process.env.SMTP_USER;

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #ea580c; font-size: 22px; margin: 0;">Barangay 178</h2>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Safety Campaign Management System</p>
                </div>
                <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="color: #9a3412; font-size: 14px; font-weight: bold; margin: 0;">📢 Campaign Announcement</p>
                    <h3 style="color: #111827; margin: 8px 0 0;">${campaign_title}</h3>
                </div>
                <p style="color: #374151; font-size: 14px; line-height: 1.6;">${campaign_message || 'Please visit our portal for more details about this campaign.'}</p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #374151; font-size: 13px; margin: 0;">🌐 Visit: <a href="http://localhost:5173" style="color: #ea580c;">barangay178.gov.ph</a> for more information.</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City
                </p>
            </div>
        `;

        const results = await Promise.allSettled(
            emails.map(email =>
                transporter.sendMail({
                    from: `"Barangay 178 System" <${smtpUser}>`,
                    to: email,
                    subject: `📢 Barangay 178 Campaign: ${campaign_title}`,
                    html: htmlBody,
                })
            )
        );

        const sent    = results.filter(r => r.status === 'fulfilled').length;
        const failed  = results.filter(r => r.status === 'rejected').length;

        console.log(`[mail] Campaign email sent: ${sent} success, ${failed} failed`);
        return res.json({
            status:  'success',
            sent,
            failed,
            total:   emails.length,
            message: `Campaign email sent to ${sent}/${emails.length} recipients`,
        });

    } catch (error) {
        console.error('[mail] Error sending campaign email:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send campaign emails', error: error.message });
    }
});

module.exports = router;
