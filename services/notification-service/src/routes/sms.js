const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const iprog = require('../services/iprog');
const semaphore = require('../services/semaphore');
const logger = require('../utils/logger');

// Stricter rate limiting for SMS endpoints
const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many SMS requests. Please wait before sending more.' },
});

router.use(smsLimiter);

// ─── POST /sms/send ────────────────────────────────────────────────────────
/**
 * Send a single SMS via the configured provider.
 * Body: { phone_number, message, provider? }
 */
router.post('/send', async (req, res) => {
  const { phone_number, message, provider = 'iprog' } = req.body;

  if (!phone_number || !message) {
    return res.status(422).json({
      error: 'Validation failed',
      details: {
        phone_number: !phone_number ? 'Phone number is required' : undefined,
        message: !message ? 'Message is required' : undefined,
      },
    });
  }

  if (message.length > 160) {
    return res.status(422).json({ error: 'Message exceeds 160 character limit' });
  }

  logger.info('Single SMS send requested', { phone_number, provider });

  let result;
  if (provider === 'semaphore') {
    result = await semaphore.sendSMS(phone_number, message);
  } else {
    result = await iprog.sendSMS(phone_number, message);
  }

  return res.status(result.success ? 200 : 502).json({
    success: result.success,
    provider,
    phone_number,
    ...(result.messageId ? { message_id: result.messageId } : {}),
    ...(result.error ? { error: result.error } : {}),
  });
});

// ─── POST /sms/bulk ────────────────────────────────────────────────────────
/**
 * Distribute SMS to multiple recipients (bulk campaign send).
 * Body: { phone_numbers[], message, campaign_title?, campaign_description?, provider? }
 */
router.post('/bulk', async (req, res) => {
  const {
    phone_numbers,
    message,
    campaign_title,
    campaign_description,
    provider = 'iprog',
  } = req.body;

  if (!phone_numbers || !Array.isArray(phone_numbers) || phone_numbers.length === 0) {
    return res.status(422).json({ error: 'phone_numbers must be a non-empty array' });
  }

  if (phone_numbers.length > 1000) {
    return res.status(422).json({ error: 'Maximum 1000 recipients per request' });
  }

  // Build message from campaign data if no explicit message provided
  let smsBody = message;
  if (!smsBody && campaign_title) {
    smsBody = `Barangay 178 Alert: ${campaign_title}`;
    if (campaign_description) {
      smsBody += `\n\n${campaign_description}`;
    }
    smsBody += '\n\nVisit barangay178.gov.ph for more details.';
  }

  if (!smsBody) {
    return res.status(422).json({ error: 'Either message or campaign_title is required' });
  }

  logger.info('Bulk SMS send requested', {
    count: phone_numbers.length,
    provider,
    campaign_title,
  });

  // Run bulk send asynchronously and respond immediately for large batches
  if (phone_numbers.length > 50) {
    // Fire-and-forget for large batches — respond with 202 Accepted
    res.status(202).json({
      accepted: true,
      message: `Bulk SMS queued for ${phone_numbers.length} recipients`,
      provider,
    });

    // Continue sending in background
    (provider === 'semaphore'
      ? semaphore.sendBulkSMS(phone_numbers, smsBody)
      : iprog.sendBulkSMS(phone_numbers, smsBody)
    ).then((result) => {
      logger.info('Bulk SMS completed (background)', result);
    }).catch((err) => {
      logger.error('Bulk SMS background error', { error: err.message });
    });

    return;
  }

  // For small batches, wait and return result
  let result;
  if (provider === 'semaphore') {
    result = await semaphore.sendBulkSMS(phone_numbers, smsBody);
  } else {
    result = await iprog.sendBulkSMS(phone_numbers, smsBody);
  }

  const status = result.success ? 200 : result.failureCount > 0 && result.successCount > 0 ? 207 : 502;

  return res.status(status).json({
    success: result.success,
    provider,
    campaign_title: campaign_title || null,
    distribution_result: result,
  });
});

// ─── GET /sms/balance ──────────────────────────────────────────────────────
/**
 * Get Semaphore account balance.
 */
router.get('/balance', async (req, res) => {
  const result = await semaphore.getBalance();
  return res.status(result.success ? 200 : 502).json(result);
});

module.exports = router;
