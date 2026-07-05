# Deploying Stitch & Bloom

The site is two pieces:

- **Frontend** (`client/`, React + Vite) → **Netlify**
- **Backend** (`server/`, Express + MongoDB) → **Render** (Netlify can't run a
  persistent Node server)

Netlify proxies `/api` and `/uploads` to Render (see `netlify.toml`), so the
browser only ever talks to one domain and login cookies keep working.

Payments use **Razorpay** (cards, UPI, Google Pay, PhonePe, net banking), in ₹.

---

## 1. MongoDB Atlas (database) — free

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a user (username + password).
3. Network Access → add IP `0.0.0.0/0` (allow anywhere — Render's IP isn't fixed on free tier).
4. Copy the connection string:
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/stitch-and-bloom`

## 2. Razorpay (payments)

1. Sign up at https://dashboard.razorpay.com
2. Settings → API Keys → **Generate Test Key** (use test keys until you're live).
3. Copy **Key ID** (`rzp_test_...`) and **Key Secret**.
4. Going live: complete KYC, then generate **Live** keys and swap them in Render.

## 3. Backend on Render

1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo. It reads `render.yaml`.
3. When prompted, fill the secret env vars:
   - `MONGODB_URI` → the Atlas string from step 1
   - `JWT_SECRET` → any long random string (e.g. `openssl rand -hex 32`)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` → from step 2
   - `CLOUDINARY_*`, `SENDGRID_API_KEY` → optional; product images/emails work once set
   - `CLIENT_URL` and `CORS_ORIGIN` → your Netlify URL (set after step 4, then redeploy)
4. Deploy. Note the service URL, e.g. `https://stitch-and-bloom-api.onrender.com`.
5. Health check: open `https://<that-url>/api/v1/health` → should return `{"status":"ok"}`.
6. (Optional) Seed sample products: Render → Shell → `node seed.js`.

> The server has a built-in keep-alive: it pings itself every 14 min (using Render's `RENDER_EXTERNAL_URL`) so the free tier never sleeps — no cold-start wait for customers. To make it truly guaranteed, upgrade to Render's Starter plan (~$7/mo) later.

## 4. Frontend on Netlify

1. Edit `netlify.toml` → replace **both** `YOUR-BACKEND.onrender.com` with your
   real Render URL from step 3. Commit and push.
2. Netlify → **Add new site → Import from Git** → select the repo.
   Build settings are read from `netlify.toml` (base `client`, publish `dist`).
3. Deploy. Note your Netlify URL, e.g. `https://stitchandbloom.netlify.app`.
4. Back in Render, set `CLIENT_URL` and `CORS_ORIGIN` to that Netlify URL and redeploy.

## 5. Custom domain (optional)

- Netlify → Domain settings → add `stitchandbloom.com` and follow the DNS steps.
- Update `CLIENT_URL` / `CORS_ORIGIN` in Render to the custom domain.

---

## Verify it works

1. Open the Netlify URL, register an account, add items to the cart.
2. Checkout → enter address → **Pay**.
3. Razorpay opens. In **test mode** use card `4111 1111 1111 1111`, any future
   expiry, any CVV; or UPI `success@razorpay`.
4. You should land on the order confirmation page, and the order shows in the
   admin panel.

## Notes

- **Product images**: local disk uploads don't survive Render restarts (free tier
  has no persistent disk). Configure Cloudinary (env vars above) so images are
  stored there. Placeholder image URLs in seed data work regardless.
- **Prices** are entered in ₹ in the admin panel and stored as paise. Free
  shipping over ₹999, else ₹79 — tune in `server/src/utils/pricing.js` (and the
  matching constants in the client checkout/cart pages).
- **GST**: prices are treated as GST-inclusive (no separate tax line). If you
  register for GST and want a tax line, set `TAX_RATE` in `pricing.js`.
