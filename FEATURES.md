# HayThar E-Commerce — Feature List

**For client review** · March 2026  
**Live URLs:** Shop — `haythar.protechmm.com` · API — `haytharapi.protechmm.com`

---

## Customer Storefront

| Feature | Status |
|---------|--------|
| Homepage — hero, bestsellers, featured products, blind box promo | ✅ Live |
| Shop — browse all products | ✅ Live |
| Categories — Apparel, Car Accessories, Accessories, Home & Kitchen, Blind Boxes | ✅ Live |
| Search & filters — category, price, in-stock, sort | ✅ Live |
| Product detail — images, price, description, reviews | ✅ Live |
| Shopping cart | ✅ Live |
| Checkout — guest or logged-in | ✅ Live |
| Multi-currency display (USD, AUD, EUR, GBP, JPY, MMK) | ✅ Live |
| Promo codes at checkout (e.g. SWEET, CUTE10) | ✅ Live |
| Free shipping above threshold (varies by currency) | ✅ Live |
| Order confirmation page | ✅ Live |
| Track order — email + order number (no login needed) | ✅ Live |
| Guest account — password-free, orders saved to browser | ✅ Live |
| Upgrade guest → full member (set password, keep orders) | ✅ Live |
| Full member — register, login, order history | ✅ Live |
| Wishlist — save items (browser; synced when logged in) | ✅ Live |
| Product reviews — 5-star ratings (members) | ✅ Live |
| Newsletter signup | ✅ Live |
| About page | ✅ Live |
| Accessibility widget — reduce motion, text size, contrast, reading mask | ✅ Live |
| Auto-detect currency by location | 🔜 Planned |
| Product variants (size, color) | 🔜 Planned |
| Digital gift cards | 🔜 Planned |

---

## Admin Dashboard

**URL:** `/admin` · Login: admin account (provided separately)

| Feature | Status |
|---------|--------|
| Dashboard — revenue, orders, customers, low-stock alerts | ✅ Live |
| Orders — view, update status, add tracking, process refunds | ✅ Live |
| Products — add, edit, delete, manage stock | ✅ Live |
| Customers — member list, purchase history | ✅ Live |
| Newsletter subscribers | ✅ Live |
| Discount codes — create, edit, usage limits, expiry | ✅ Live |
| Sales & product performance reports | ✅ Live |
| Shipment email notifications to customers | 🔜 Planned |
| Homepage / blog CMS | 🔜 Planned |

---

## Demo Accounts (testing only)

| Role | Email | Password |
|------|-------|----------|
| Customer | demo@haythar.com | password |
| Admin | admin@haythar.com | password |

*Change these before public launch.*

---

## Tech Summary

- **Shop:** React + Tailwind (fast, mobile-friendly)
- **Backend:** Laravel API + secure login (Sanctum)
- **Catalog:** 42 products across 5 categories (seed data)

---

**Legend:** ✅ Live · 🔜 Planned
