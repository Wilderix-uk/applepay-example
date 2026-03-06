# Apple Pay Example - Next.js

A simple Apple Pay checkout demonstration built with Next.js, converted from the original PHP version.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Frontend Form:** Input Entity ID, Access Token, Currency, and Amount
- **API Checkout Endpoint:** `/api/checkout` - Creates checkout session with payment gateway
- **API Result Endpoint:** `/api/result` - Retrieves payment result after transaction
- **Apple Pay Widget:** Integrated payment widget using OPPWA gateway

## Deployment to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/applepay-example.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Configure environment variables (if needed)
   - Click "Deploy"

3. **Add Custom Domain:**
   - In Vercel project settings → Domains
   - Add `applepayexample.wilderix.uk`
   - Follow DNS instructions to update your domain registrar

## API Endpoints

### POST `/api/checkout`
Creates a checkout session with the payment gateway.

**Request:**
```json
{
  "entityId": "8ac7a4c7921bbc1e01922049d74b0738",
  "accessToken": "OGFjN2E0YzViNjRmYzZkYjAxNjZhYTgwODc0OGU5Mzk=",
  "currency": "USD",
  "amount": "99.99"
}
```

**Response:**
```json
{
  "id": "checkout_id_here",
  "checkoutId": "checkout_id_here",
  "resultUrl": "https://..."
}
```

### GET `/api/result?id=checkoutId&entityId=...&accessToken=...`
Retrieves the payment result after transaction.

**Response:**
```json
{
  "checkoutId": "checkout_id_here",
  "result": {
    "result": "CREATED",
    "ndc": "..."
  }
}
```

## Configuration

The app uses the following payment gateway endpoint:
- **Checkout:** `https://eu-test.oppwa.com/v1/checkouts`
- **Result:** `https://eu-prod.oppwa.com/v1/checkouts/{id}/payment`

Update these URLs in the API routes if using a different region or provider.

## Testing

Use test credentials provided by your payment gateway.

## Security Notes

- ⚠️ **Never commit API keys to Git.** Use Vercel environment variables.
- ⚠️ **Enable SSL verification in production** (set `rejectUnauthorized: true`)
- ⚠️ **Validate all inputs** before passing to payment gateway

## File Structure

```
applepay-example/
├── pages/
│   ├── api/
│   │   ├── checkout.js      # Creates checkout session
│   │   └── result.js        # Retrieves payment result
│   └── index.js             # Main form page
├── styles/
│   └── Home.module.css      # Styling
├── public/                  # Static assets
├── package.json
├── next.config.js
└── README.md
```

## Troubleshooting

- **"Entity ID must be 32 characters"** - Check your Entity ID is correct length
- **"Access Token cannot be empty"** - Verify your API token is valid
- **Payment widget not loading** - Check browser console for CORS/SSL issues
- **Checkout fails silently** - Check Vercel logs: `vercel logs applepayexample`

## License

MIT
