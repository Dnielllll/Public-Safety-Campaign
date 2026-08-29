const axios = require('axios');
const logger = require('../utils/logger');

const BASE_URL = 'https://api.semaphore.co/api/v4';

/**
 * Format a phone number to Philippine format expected by Semaphore (09XXXXXXXXX)
 */
function formatPhoneNumber(number) {
  let n = number.replace(/[^0-9]/g, '');

  if (n.startsWith('63')) {
    n = '0' + n.slice(2);
  } else if (n.startsWith('+63')) {
    n = '0' + n.slice(3);
  } else if (!n.startsWith('09')) {
    if (n.length === 10 && n.startsWith('9')) {
      n = '0' + n;
    }
  }

  return n;
}

/**
 * Send SMS to a single number via Semaphore
 * @param {string} number
 * @param {string} message
 * @param {string} [senderName='Barangay178']
 * @returns {Promise<{success: boolean, messageId?: string, data?: any, error?: string}>}
 */
async function sendSMS(number, message, senderName = 'Barangay178') {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) {
    logger.warn('SEMAPHORE_API_KEY not configured');
    return { success: false, error: 'SEMAPHORE_API_KEY not configured' };
  }

  const formattedNumber = formatPhoneNumber(number);

  try {
    const response = await axios.post(
      `${BASE_URL}/messages`,
      new URLSearchParams({
        apikey: apiKey,
        number: formattedNumber,
        message,
        sendername: senderName,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    const data = response.data;
    if (Array.isArray(data) && data[0]?.status === 'success') {
      logger.info(`Semaphore SMS sent to ${formattedNumber}`, { messageId: data[0].message_id });
      return { success: true, messageId: data[0].message_id, data: data[0] };
    }

    const errMsg = data[0]?.message || 'Unknown Semaphore error';
    logger.error(`Semaphore SMS failed for ${formattedNumber}`, { error: errMsg });
    return { success: false, error: errMsg, data };
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    logger.error(`Semaphore SMS exception for ${formattedNumber}`, { error: errMsg });
    return { success: false, error: errMsg };
  }
}

/**
 * Send bulk SMS via Semaphore
 */
async function sendBulkSMS(numbers, message, senderName = 'Barangay178') {
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const number of numbers) {
    const result = await sendSMS(number, message, senderName);
    results.push({ number, ...result });

    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }

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

/**
 * Get Semaphore account balance
 */
async function getBalance() {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) return { success: false, error: 'SEMAPHORE_API_KEY not configured' };

  try {
    const response = await axios.get(`${BASE_URL}/account`, {
      params: { apikey: apiKey },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });
    return { success: true, balance: response.data.balance, data: response.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { sendSMS, sendBulkSMS, getBalance };
