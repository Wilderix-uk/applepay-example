// Replaces shopperResultUrl.php - retrieves payment result
import axios from 'axios';

export default async function handler(req, res) {
  const { id, environment } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Checkout ID is required' });
  }

  // In production, retrieve these from session/database
  // For now, they should be passed as query params or from a secure session
  const entityId = req.query.entityId;
  const accessToken = req.query.accessToken;

  if (!entityId || !accessToken) {
    return res.status(400).json({
      error: 'Entity ID and Access Token are required',
      checkoutId: id,
    });
  }

  try {
    // Use the selected environment (test or live)
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
