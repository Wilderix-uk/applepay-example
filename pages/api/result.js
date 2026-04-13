// Replaces shopperResultUrl.php - retrieves payment result
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id, token } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Checkout ID is required' });
  }

  if (!token) {
    return res.status(400).json({ error: 'Missing credential token' });
  }

  // Verify and decode the short-lived JWT issued at checkout time
  const secret = process.env.CHECKOUT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfiguration: missing CHECKOUT_SECRET' });
  }

  let entityId, accessToken, environment;
  try {
    const decoded = jwt.verify(token, secret);
    entityId = decoded.entityId;
    accessToken = decoded.accessToken;
    environment = decoded.environment;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired credential token' });
  }

  try {
    // Use the environment from the verified token
    const baseUrl = environment === 'live'
      ? 'https://eu-prod.oppwa.com'
      : 'https://eu-test.oppwa.com';

    const url = `${baseUrl}/v1/checkouts/${id}/payment`;

    const response = await axios.get(url, {
      params: {
        entityId: entityId,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      httpsAgent: {
        rejectUnauthorized: true, // Set to true in production
      },
    });

    return res.status(200).json({
      checkoutId: id,
      environment: environment,
      result: response.data,
    });
  } catch (error) {
    console.error('Result fetch error:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch payment result',
      checkoutId: id,
      details: error.message,
    });
  }
}
