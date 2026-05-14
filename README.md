# 🌟 StellarPay

> Accept stablecoin (USDC) payments for your small business using the Stellar blockchain. Create payment links, embed checkout buttons, and get paid instantly — no bank account required.

[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-blue?logo=stellar)](https://stellar.org)
[![USDC](https://img.shields.io/badge/Stablecoin-USDC-green)](https://www.circle.com/en/usdc)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org)

---

## Overview

StellarPay is an open-source, production-ready MVP checkout platform built on the [Stellar](https://stellar.org) blockchain. It allows merchants to:

- ✅ Create shareable **payment links** (`/pay/abc123`)
- ✅ Embed a **checkout button** on any website
- ✅ Accept **USDC** stablecoin payments directly to their Stellar wallet
- ✅ Monitor payments in a real-time **merchant dashboard**
- ✅ Receive **webhook notifications** on payment confirmation
- ✅ Scan **QR codes** for mobile-friendly payments

Payments are **non-custodial** — funds go directly to the merchant's Stellar wallet.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 14 (App Router, TypeScript) |
| Styling     | TailwindCSS                       |
| Blockchain  | Stellar SDK (JS) + Horizon API    |
| Database    | PostgreSQL + Prisma ORM           |
| Auth        | Custom JWT (jose)                 |
| Deployment  | Vercel                            |

---

## Project Structure

```
stellarpay/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── page.tsx                # Overview
│   │   ├── links/
│   │   │   ├── page.tsx            # Payment links list
│   │   │   └── new/page.tsx        # Create link
│   │   ├── payments/page.tsx       # Transaction history
│   │   └── settings/page.tsx       # Merchant settings
│   ├── pay/[slug]/page.tsx         # Hosted checkout page
│   └── api/
│       ├── auth/signup/route.ts
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       ├── merchants/me/route.ts
│       ├── merchants/wallet/route.ts
│       ├── checkout/route.ts
│       ├── checkout/[id]/route.ts
│       ├── payments/route.ts
│       ├── payments/[id]/route.ts
│       ├── pay/route.ts
│       └── pay/verify/route.ts
├── components/
│   └── checkout/
│       └── QRCodeDisplay.tsx
├── lib/
│   ├── stellar/
│   │   ├── client.ts               # Stellar SDK integration
│   │   └── encryption.ts           # AES-256-GCM for secret keys
│   ├── db/
│   │   └── client.ts               # Prisma singleton
│   ├── auth/
│   │   └── session.ts              # JWT session management
│   └── utils/
│       ├── index.ts
│       └── webhook.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── .env.example
└── README.md
```

---

## Setup Instructions

### 1. Clone and install

```bash
git clone https://github.com/your-org/stellarpay
cd stellarpay
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/stellarpay"
NEXTAUTH_SECRET="your-random-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="your-64-char-hex-key"

# Keep as-is for testnet development
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_USDC_ISSUER="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
```

### 3. Set up the database

```bash
# Run migrations
npm run db:push

# Seed with a demo merchant account
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable               | Description                                    | Required |
|------------------------|------------------------------------------------|----------|
| `DATABASE_URL`         | PostgreSQL connection string                   | ✅       |
| `NEXTAUTH_SECRET`      | Random secret for JWT signing (min 32 chars)   | ✅       |
| `NEXTAUTH_URL`         | Your app's base URL                            | ✅       |
| `NEXT_PUBLIC_APP_URL`  | Public URL (same as above, used client-side)   | ✅       |
| `ENCRYPTION_KEY`       | 64-char hex key for encrypting Stellar secrets | ✅       |
| `STELLAR_NETWORK`      | `TESTNET` or `MAINNET`                         | ✅       |
| `STELLAR_HORIZON_URL`  | Horizon API endpoint                           | ✅       |
| `STELLAR_USDC_ISSUER`  | USDC issuer address for the chosen network     | ✅       |
| `WEBHOOK_SECRET`       | HMAC secret for signing webhook payloads       | ⬜       |

---

## How to Test Payments

### Option A: Use Stellar Laboratory

1. Sign up and create a payment link at `/dashboard/links/new`
2. Visit the generated checkout URL (e.g. `/pay/abc123`)
3. Click **"Pay with Stellar"** — note the memo and address
4. Open [Stellar Laboratory](https://laboratory.stellar.org/) → Transaction Builder
5. Build a payment operation:
   - **Destination**: merchant's Stellar public key
   - **Asset**: USDC (with testnet issuer)
   - **Amount**: the exact amount
   - **Memo (text)**: the `SP-xxxxxxxx` memo shown on checkout
6. Sign and submit
7. The checkout page auto-confirms within 5 seconds ✅

### Option B: Use Freighter Wallet

1. Install [Freighter](https://freighter.app) browser extension
2. Switch to **Testnet** mode
3. Fund your account using [Stellar Friendbot](https://friendbot.stellar.org)
4. Add USDC trustline using the testnet issuer
5. Send payment from Freighter with the correct memo

---

## Stellar Integration Explained

For a visual end-to-end view of the payment lifecycle, system components, and Stellar terminology, see [docs/architecture.md](docs/architecture.md).

### Account Creation
When a merchant signs up, `generateKeypair()` creates a new Stellar keypair. The public key is stored in the database; the secret key is encrypted with AES-256-GCM before storage (`lib/stellar/encryption.ts`).

On testnet, the account is funded automatically via Friendbot. On mainnet, merchants fund their own accounts with XLM (required to activate an account and pay fees).

### Payment Detection
Each payment order gets a unique `stellarMemo` (e.g. `SP-a1b2c3d4`). When a customer sends USDC, we:

1. Query `server.payments().forAccount(merchantPublicKey)` via Horizon API
2. Filter for USDC payments matching the memo and amount
3. Confirm the transaction on-chain via `server.transactions().transaction(txHash)`

### Stablecoin (USDC) Support
USDC on Stellar is a Stellar asset with code `USDC` and a specific issuer address. On testnet this is Circle's test issuer. On mainnet, use `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`.

### SEP-7 Payment URIs
Checkout pages generate a `web+stellar:pay?...` URI that Stellar wallet apps (Freighter, LOBSTR, etc.) can open to pre-fill all payment details — making mobile payments seamless.

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

For the database, use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for a managed PostgreSQL instance compatible with Vercel serverless functions.

---

## Mainnet Deployment Notes

Before going to mainnet:

1. Change `STELLAR_NETWORK` to `MAINNET`
2. Update `STELLAR_HORIZON_URL` to `https://horizon.stellar.org`
3. Update `STELLAR_USDC_ISSUER` to Circle's mainnet USDC issuer
4. Remove Friendbot account funding (it only works on testnet)
5. Ensure `ENCRYPTION_KEY` is a truly random, securely stored secret
6. Enable HTTPS everywhere
7. Rotate all secrets

---

## Contributing

StellarPay is designed to be a Stellar Wave maintainer repository. PRs welcome! Please open an issue first for large changes.

---

## License

MIT — free to use, fork, and deploy commercially.
