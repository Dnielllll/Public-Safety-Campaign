const axios = require('axios');
const logger = require('../utils/logger');

const BASE_URL = 'https://www.iprogsms.com/api/v1/sms_messages';

/**
 * Format a phone number to Philippine format expected by iProg (639XXXXXXXXX)
 */
function formatPhoneNumber(number) {
  // Strip all non-numeric characters
  let n = number.replace(/[^0-9]/g, '');

  if (n.startsWith('0')) {
    n = '63' + n.slice(1);
  } else if (n.startsWith('+63')) {
    n = n.slice(1); // remove the +
  } else if (!n.startsWith('63')) {
    // 10 digits starting with 9 → prepend 63
    if (n.length === 10 && n.startsWith('9')) {
      n = '63' + n;
    }
  }

  return n;
}

/**
 * Send SMS to a single number via iProg
 * @param {string} number - recipient phone number
 * @param {string} message - SMS body
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function sendSMS(number, message) {
  const apiToken = process.env.IPROG_API_TOKEN;
  if (!apiToken) {
    logger.warn('IPROG_API_TOKEN not configured');
    return { success: false, error: 'IPROG_API_TOKEN not configured' };
  }

  const formattedNumber = formatPhoneNumber(number);

  try {
    const response = await axios.post(
      BASE_URL,
      new URLSearchParams({
        api_token: apiToken,
        message,
        phone_number: formattedNumber,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    logger.info(`iProg SMS sent to ${formattedNumber}`, { status: response.status });
    return { success: true, data: response.data };
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    logger.error(`iProg SMS failed for ${formattedNumber}`, { error: errMsg });
    return { success: false, error: errMsg };
  }
}

/**
 * Send bulk SMS to multiple numbers (sequential with 100ms delay to avoid rate limits)
 * @param {string[]} numbers
 * @param {string} message
 * @returns {Promise<{success: boolean, total: number, successCount: number, failureCount: number, results: any[]}>}
 */
async function sendBulkSMS(numbers, message) {
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const number of numbers) {
    const result = await sendSMS(number, message);
    results.push({ number, ...result });

    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }

    // 100ms delay between sends to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    success: failureCount === 0,
    total: numbers.length,
    successCount,
    failureCount,
    results,
  };
}

module.exports = { sendSMS, sendBulkSMS };
