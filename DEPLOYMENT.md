# Deployment Guide: applepayexample.wilderix.uk

## Quick Start (5 minutes)

### Step 1: Initialize Git Repository

```bash
cd /Users/robert.wilder/.openclaw/workspace/applepay-example
git init
git add .
git commit -m "Initial commit: Apple Pay example app"
```

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it: `applepay-example`
3. Push local code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/applepay-example.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add custom domain when prompted
# Domain: applepayexample.wilderix.uk
```

#### Option B: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"
5. Environment variables (if needed):
   - Add any secrets as environment variables
6. Click "Deploy"
7. Wait 2-3 minutes for deployment
8. Go to project settings → Domains
9. Add domain: `applepayexample.wilderix.uk`

### Step 4: Configure DNS (If needed)

If you own wilderix.uk domain:

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add CNAME record:
   - Name: `applepayexample`
   - Value: `cname.vercel-dns.com`
3. Wait 15-30 minutes for DNS propagation

**If already using Vercel for wilderix.uk:**
- Just add the subdomain in Vercel project settings
- Vercel handles DNS automatically

### Step 5: Verify Deployment

Visit: https://applepayexample.wilderix.uk

You should see the Apple Pay form.

---

## What Was Converted

### Before (PHP)
- `index.php` → Frontend form
- `functions.php` → Backend checkout logic
- `shopperResultUrl.php` → Result handling
- Manual session management

### After (Next.js)
- `pages/index.js` → Frontend form (React component)
- `pages/api/checkout.js` → API route (same logic)
- `pages/api/result.js` → API route (same logic)
- Automatic environment variable handling

---

## Testing Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

---

## Production Checklist

- [ ] GitHub repository created and pushed
- [ ] Vercel project connected to GitHub
- [ ] Custom domain added (applepayexample.wilderix.uk)
- [ ] DNS configured (CNAME or Vercel auto-config)
- [ ] SSL certificate installed (automatic with Vercel)
- [ ] Test checkout flow works
- [ ] API endpoints return correct data
- [ ] Payment gateway credentials verified

---

## Troubleshooting Deployment

### Domain not working
- Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- Wait 30 minutes for DNS to update
- Verify CNAME record in your registrar

### Build failed
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify no hardcoded file paths

### API endpoint errors
- Check Vercel function logs
- Verify payment gateway URLs are accessible
- Check API credentials are correct

### CORS errors
- Payment gateway URLs should work from browser
- If needed, add proxy in `vercel.json`

---

## Redeployment

Every time you push to GitHub:
```bash
git add .
git commit -m "Your message"
git push
```

Vercel automatically rebuilds and deploys within 1-2 minutes.

---

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Payment Gateway: https://oppwa.com
