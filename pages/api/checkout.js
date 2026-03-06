// Replaces functions.php - creates a checkout session
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { entityId, accessToken, amount, currency, environment } = req.body;

  // Validation
  if (!entityId || entityId.length !== 32) {
    return res.status(400).json({ error: 'Invalid Entity ID (must be 32 characters)' });
  }
  if (!accessToken || !accessToken.trim()) {
    return res.status(400).json({ error: 'Access Token cannot be empty' });
  }
  if (!currency || currency.length !== 3) {
    return res.status(400).json({ error: 'Invalid currency (must be 3 characters)' });
  }
  if (!amount || !/^\d+(\.\d{1,2})?$/.test(amount)) {
    return res.status(400).json({ error: 'Invalid amount format' });
  }

  try {
    // Use the selected environment (test or live)
    const baseUrl = environment === 'live' 
      ? 'https://eu-prod.oppwa.com' 
      : 'https://eu-test.oppwa.com';
    
    const url = `${baseUrl}/v1/checkouts`;
    
    const response = await axios.post(
      url,
      new URLSearchParams({
        entityId: entityId,
        amount: amount,
        currency: currency,
        paymentType: 'DB',
      }).toString(),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Store in session for later use
    req.session = req.session || {};
    req.session.entityId = entityId;
    req.session.accessToken = accessToken;
    req.session.environment = environment;

    return res.status(200).json({ ...response.data, environment });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message,
    });
  }
}
