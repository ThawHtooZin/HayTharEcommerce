# MVP Recommendations Message

## Message

The current Mya Hay Thar ecommerce platform is a credible MVP: customers can discover products, add them to a cart, check out as a guest or member, track orders, save wishlists, submit reviews, and use multiple currencies. Admins can monitor KPIs, manage orders and stock, review manual payments, manage discount codes, view customers, and read reports.

Before public launch, the recommended work is to close the operational and trust gaps below. These items have higher value than adding more merchandising features because they protect revenue, customer data, fulfillment, and support workload.

## Recommended Next Features

| Priority | Recommendation | Why it matters | MVP exit condition |
|---|---|---|---|
| P0 | Replace demo card checkout with a compliant payment gateway | The current card path explicitly does not process real payments. | One supported gateway succeeds in sandbox and production-like testing; webhook reconciliation is implemented. |
| P0 | Add transactional order and shipment emails | Customers and staff need reliable confirmation, payment, shipment, and refund communication. | Email templates, queue/retry behavior, and duplicate-send protection are tested. |
| P0 | Harden checkout transactions and idempotency | Concurrent checkout or repeated submission can otherwise create duplicate orders or inconsistent stock. | Server-side transaction, idempotency key, and rollback tests pass. |
| P0 | Complete security and production configuration | Demo credentials, token exposure, file uploads, rate limits, and HTTPS need release controls. | Secrets are environment-based, demo accounts are removed, uploads are private/validated, HTTPS and rate limits are verified. |
| P0 | Add legal and policy pages | Privacy, terms, shipping, and refund policies are required for customer trust and payment operations. | Footer links resolve to reviewed, versioned policy pages. |
| P1 | Implement returns, partial refunds, and refund audit trail | The current admin flow is full-refund oriented and does not provide a complete returns process. | Admin can approve return, refund partially or fully, restore correct stock, and record reason/operator/time. |
| P1 | Add saved-address management | The account screen currently shows a placeholder address rather than real CRUD. | Member can add, edit, delete, select, and validate addresses at checkout. |
| P1 | Improve inventory and catalog management UI | API support exists, but product creation/editing and variant-ready catalog operations need a complete admin workflow. | Admin can manage product image, SKU, description, category, price, stock, and validation from the UI. |
| P1 | Add automated and browser regression tests | The repository has API-oriented tests, but every customer and admin journey needs release confidence. | Critical P0/P1 cases in `TEST-CASES.md` run in CI on every change. |
| P1 | Add observability and support diagnostics | Checkout, payment-slip review, stock, and email failures need actionable logs and alerts. | Correlation IDs, structured logs, error tracking, and health checks are available without logging secrets. |
| P2 | Add location-based currency detection | It reduces friction for international shoppers but is not required for the first stable launch. | Detection suggests a currency, never overrides an explicit choice, and handles privacy/failure cases. |
| P2 | Add product variants | Size/color/style support expands apparel and collectible catalog quality. | Variant stock, SKU, price, selection, cart, order, and admin editing are all modeled consistently. |
| P2 | Add digital gift cards | Useful for gifting and repeat purchases, but introduces payment, balance, fraud, and delivery complexity. | Purchase, delivery, redemption, expiry, refund, and abuse cases are defined and tested. |
| P2 | Add homepage/blog CMS and sale banners | Enables non-developer marketing changes after core operations are stable. | Admin preview, publish, rollback, scheduling, and media validation exist. |
| P2 | Add real-time dashboard alerts and richer reporting | Helpful for scale, but current KPI and report endpoints cover the basic MVP need. | Alerts are actionable and reports define gross/net/tax/shipping calculations clearly. |

## Suggested Release Sequence

1. **Launch gate:** real payment, checkout transaction safety, production security, legal pages, and critical API/browser tests.
2. **Operations gate:** shipment emails, returns/refunds, address management, catalog admin completeness, and observability.
3. **Growth gate:** currency detection, variants, gift cards, CMS, sale banners, and advanced reports.

## Explicitly Defer for the MVP

- Blog publishing and homepage editing before checkout and fulfillment are reliable.
- Digital gift cards before real payment and refund rules are established.
- Complex variant support without a SKU and inventory model.
- Real-time analytics before KPI definitions and data quality are agreed.
- Marketing automation before newsletter consent, export, and unsubscribe behavior are complete.

## Decision Message for the Team

> We should treat the current product as feature-complete for a demo and early validation, but not yet payment-ready for a public launch. The next sprint should prioritize real payments, transaction safety, security hardening, customer notifications, legal policies, and automated regression coverage. After those safeguards are in place, returns, addresses, and richer catalog operations should come next. Variants, gift cards, CMS, and advanced marketing are valuable follow-on work, but they should not displace the operational launch blockers.
