# Mya Hay Thar Ecommerce - Test Cases

This is the complete acceptance and regression checklist for the features listed in `FEATURES.md` and `srs.txt`. Status reflects the current MVP implementation, not test execution. `Implemented` cases should be automated or manually verified against the current code. `Planned` cases are release-gate cases for the feature before it is enabled.

## Test Data and Preconditions

- Customer: `demo@haythar.com` / `password`.
- Admin: `admin@haythar.com` / `password`.
- At least one in-stock product, one low-stock product, one out-of-stock product, and two categories.
- A valid manual-payment test slip in JPG, PNG, and PDF formats; invalid type and over-5MB files.
- Valid and expired discount codes, including `SWEET` and `CUTE10` where seeded.
- Test currencies: USD, AUD, EUR, GBP, JPY, MMK.
- Use a clean browser profile for guest, localStorage, wishlist, and accessibility cases.

## Storefront and Catalog

| ID | Feature | Expected result | Status |
|---|---|---|---|
| CAT-001 | Homepage hero and promotions | Homepage loads hero, featured products, bestsellers, and blind-box promotion without console errors. | Implemented |
| CAT-002 | Category browsing | Each supported category returns only matching products and an empty result is handled cleanly. | Implemented |
| CAT-003 | Product list | Shop loads products with name, image, price, stock state, and category. | Implemented |
| CAT-004 | Search | Search returns matching products and no-result state is readable. | Implemented |
| CAT-005 | Category filter | Category filter can be applied, changed, and cleared. | Implemented |
| CAT-006 | Category filter state | Category filtering does not reset unrelated controls unexpectedly. | Implemented |
| CAT-007 | Price sorting | Low-to-high and high-to-low order products numerically. | Implemented |
| CAT-008 | Availability filter | In-stock filter excludes unavailable products; out-of-stock products cannot be added. | Implemented |
| CAT-009 | Product detail | Valid slug loads images, description, price, stock, category, and reviews. | Implemented |
| CAT-010 | Invalid product | Unknown slug shows a controlled not-found state, not a blank screen. | Implemented |
| CAT-011 | Product image fallback | Missing or invalid image does not break the card or detail layout. | Implemented |
| CAT-012 | Mobile and desktop layout | Catalog controls and product cards remain usable at mobile and desktop widths. | Implemented |
| CAT-013 | Auto currency detection | Location suggests the correct currency and user can override it. | Planned |
| CAT-014 | Product variants | Size, color, and style selections are required, persisted in cart, and saved on order items. | Planned |
| CAT-015 | Digital gift cards | Gift card denomination, recipient, code creation, delivery, redemption, and balance are correct. | Planned |

## Cart, Pricing, and Checkout

| ID | Feature | Expected result | Status |
|---|---|---|---|
| CART-001 | Add to cart | Product and quantity appear in cart and persist after refresh. | Implemented |
| CART-002 | Quantity controls | Increment, decrement, remove, and boundary behavior work; quantity never becomes zero through an invalid state. | Implemented |
| CART-003 | Cart persistence | Cart survives navigation and browser refresh, and clears after successful order. | Implemented |
| CART-004 | Empty cart | Empty cart provides a clear path back to the shop and blocks checkout. | Implemented |
| CART-005 | Multi-currency display | USD, AUD, EUR, GBP, JPY, and MMK display with correct symbol/formatting. | Implemented |
| CART-006 | No automatic volume discount | Cart and checkout never apply a quantity-based discount; discount remains zero unless an explicit promo code is accepted. | Implemented |
| CART-007 | Promo code valid | Valid code applies its configured discount once and appears in order totals. | Implemented |
| CART-008 | Promo code invalid | Invalid, expired, over-limit, and empty codes return a clear validation result and do not reduce total. | Implemented |
| CART-009 | Shipping threshold | Free shipping applies at or above the currency threshold after any explicit promo discount; otherwise shipping is charged. | Implemented |
| CART-010 | Total integrity | API recalculates subtotal, discount, shipping, and total from product records; client totals cannot be trusted to lower payment. | Implemented |
| CART-011 | Stock race | Order fails safely when requested quantity exceeds current stock, with no partial order or negative stock. | Implemented |
| CHECK-001 | Guest checkout | Guest can submit valid email, name, address, payment method, and cart without registering. | Implemented |
| CHECK-002 | Member checkout | Authenticated member can checkout without resubmitting email and order links to user. | Implemented |
| CHECK-003 | Required fields | Missing email, names, address, payment method, or items returns field errors and creates no order. | Implemented |
| CHECK-004 | Manual payment methods | Manual method requires slip, accepts JPG/PNG/WEBP/PDF up to 5MB, and stores it. | Implemented |
| CHECK-005 | Invalid payment slip | Unsupported file or file over 5MB is rejected and no order is created. | Implemented |
| CHECK-006 | Demo card checkout | Card flow creates a processing order and clearly does not charge a real card. | Implemented |
| CHECK-007 | Order confirmation | Successful order shows order number, items, totals, and correct guest/member state. | Implemented |
| CHECK-008 | Duplicate submit | Double click or retry does not create unintended duplicate orders. | Regression risk: verify |

## Accounts, Guest Sessions, Wishlist, and Reviews

| ID | Feature | Expected result | Status |
|---|---|---|---|
| ACC-001 | Member registration | Valid name, email, and matching 8+ character password create a customer and token. | Implemented |
| ACC-002 | Registration validation | Duplicate email, invalid email, short password, and mismatched confirmation are rejected. | Implemented |
| ACC-003 | Member login | Valid credentials issue token and redirect to requested page. | Implemented |
| ACC-004 | Login failure | Wrong credentials return a safe error without revealing whether an email exists. | Implemented |
| ACC-005 | Member logout | Token is revoked/removed and protected data is inaccessible afterward. | Implemented |
| ACC-006 | Member order history | Member sees only their own orders with status, totals, payment state, and tracking number. | Implemented |
| ACC-007 | Guest account creation | Guest checkout creates browser-bound token and associates future orders using that token. | Implemented |
| ACC-008 | Guest order history | Valid guest token returns only that guest's orders; missing or invalid token is rejected. | Implemented |
| ACC-009 | Guest limitations | Guest cannot use member-only wishlist, review, profile, or cross-device features. | Implemented |
| ACC-010 | Guest upgrade | Password upgrade creates member, migrates all guest orders, removes guest record, and issues token. | Implemented |
| ACC-011 | Guest upgrade conflict | Existing member email is rejected with sign-in guidance and guest data remains consistent. | Implemented |
| ACC-012 | Order claim | Email plus order number can claim an unlinked guest order and migrate matching guest orders. | Implemented |
| ACC-013 | Claim security | Wrong email, unknown order, already linked order, or weak password is rejected. | Implemented |
| ACC-014 | Local wishlist | Guest wishlist survives refresh and remains device-local. | Implemented |
| ACC-015 | Synced wishlist | Member can add, list, and remove wishlist items across sessions. | Implemented |
| ACC-016 | Wishlist authorization | A member cannot read or mutate another member's wishlist by changing IDs. | Implemented |
| ACC-017 | Product review | Authenticated member who purchased product can submit one valid rating/review. | Implemented |
| ACC-018 | Review restrictions | Guest, non-purchaser, invalid rating, and repeat review are rejected. | Implemented |
| ACC-019 | Newsletter signup | Valid email creates subscription and duplicate email is handled idempotently. | Implemented |
| ACC-020 | Newsletter validation | Invalid or blank email is rejected without creating a subscriber. | Implemented |
| ACC-021 | Saved addresses | Member can create, edit, select, and delete an address and checkout uses the selected value. | Planned |

## Order Tracking and Admin Operations

| ID | Feature | Expected result | Status |
|---|---|---|---|
| ORD-001 | Manual tracking lookup | Correct email and order number return order details without login. | Implemented |
| ORD-002 | Tracking failure | Wrong email or order number does not disclose another customer's order. | Implemented |
| ORD-003 | Recent guest orders | Orders saved on device can be selected to populate tracking lookup. | Implemented |
| ORD-004 | Status display | Pending, processing, shipped, delivered, cancelled, and refunded statuses render consistently. | Implemented |
| ORD-005 | Admin authorization | Unauthenticated customers and non-admin members cannot call admin endpoints. | Implemented |
| ORD-006 | Admin dashboard KPIs | Revenue, active orders, average order value, customers, alerts, recent orders, and top products load. | Implemented |
| ORD-007 | Admin order filter | Status and payment-status filters return the correct order set. | Implemented |
| ORD-008 | Admin status update | Admin can set valid lifecycle status and it appears to customers. | Implemented |
| ORD-009 | Add tracking | Tracking number saves and order moves to shipped. | Implemented |
| ORD-010 | Manual payment confirmation | Slip-submitted order becomes confirmed and is available for fulfillment. | Implemented |
| ORD-011 | Manual payment rejection | Rejection stores reason and exposes a retry/support path. | Implemented |
| ORD-012 | Refund | Full refund marks order refunded and restores inventory exactly once. | Implemented |
| ORD-013 | Product management | Admin can list, create, edit, and delete products with valid price, stock, image, SKU, and description. | Implemented/API; UI coverage verify |
| ORD-014 | Stock adjustment | Stock update changes in-stock state correctly at zero and above zero. | Implemented |
| ORD-015 | Customer directory | Search returns member and guest/customer purchase metrics authorized for admin. | Implemented |
| ORD-016 | Newsletter administration | Admin can view/export-ready subscriber list and customer cannot access it. | Implemented/view; export verify |
| ORD-017 | Discount administration | Admin can create, edit, delete codes with percentage, usage limit, and expiry. | Implemented |
| ORD-018 | Discount enforcement | Usage limit and expiry are enforced during checkout, including concurrent use. | Implemented/API; concurrency verify |
| ORD-019 | Sales reports | Date range report returns correct gross/net/tax/shipping values. | Implemented/API; tax requirement verify |
| ORD-020 | Product performance | Report ranks bestsellers and identifies slow-moving inventory correctly. | Implemented |
| ORD-021 | Shipment email | Adding tracking sends one correct notification and retries safely. | Planned |
| ORD-022 | Returns and partial refunds | Return approval, partial refund, inventory restoration, and audit trail work. | Planned |
| ORD-023 | Real-time alerts | Low stock, registrations, and support alerts update without manual refresh. | Planned |

## Accessibility, Security, Reliability, and Non-Functional Tests

| ID | Feature | Expected result | Status |
|---|---|---|---|
| NFR-001 | Reduced motion | Stop animations persists and disables non-essential motion. | Implemented |
| NFR-002 | Text size | Text-size option persists without clipping or overlap. | Implemented |
| NFR-003 | Contrast and reading mask | Contrast and reading-mask settings visibly apply and remain usable. | Implemented |
| NFR-004 | Keyboard access | All navigation, forms, dialogs, filters, and buttons are keyboard reachable with visible focus. | Implemented target |
| NFR-005 | Screen reader labels | Inputs, buttons, images, errors, status changes, and file upload have meaningful accessible names. | Implemented target |
| NFR-006 | Responsive behavior | Main workflows work at mobile, tablet, and desktop widths without horizontal overflow. | Implemented target |
| NFR-007 | Password protection | Passwords are hashed and never returned in API responses or logs. | Implemented |
| NFR-008 | Token isolation | Sanctum and guest tokens cannot access other users' data. | Implemented |
| NFR-009 | Input validation | Malformed IDs, quantities, files, codes, and HTML/script payloads are rejected or safely encoded. | Implemented target |
| NFR-010 | Rate limiting | Login, tracking, newsletter, review, and checkout endpoints resist abuse. | Verify |
| NFR-011 | Database integrity | Failed checkout rolls back order items, stock, guest account, and uploaded file metadata consistently. | Verify |
| NFR-012 | HTTPS and payment compliance | Production uses HTTPS and real payment data is never handled by the demo-card flow. | Deployment gate |
| NFR-013 | Legal pages | Privacy, terms, refund/return, and shipping policy links are present and accurate. | Planned |
| NFR-014 | Loading and error states | API delays, empty results, 4xx, 5xx, and offline states are understandable and recoverable. | Implemented target |

## Planned CMS and Marketing Tests

| ID | Feature | Expected result | Status |
|---|---|---|---|
| CMS-001 | Homepage CMS | Admin can update hero/carousel, featured categories, and featured products with preview and validation. | Planned |
| CMS-002 | Blog CMS | Admin can create, edit, publish, unpublish, and view blog posts safely. | Planned |
| CMS-003 | Sale banners | Admin can schedule a sitewide banner and storefront shows it only within the active window. | Planned |
| CMS-004 | Newsletter export | Admin can export subscriber list in an agreed format with privacy controls. | Planned |

## Automation Priority

1. Automate API tests for checkout pricing, stock, guest/member ownership, authentication, admin authorization, refunds, discount limits, and payment slips.
2. Add browser tests for catalog discovery, cart, guest checkout, member checkout, tracking, guest upgrade, wishlist, and admin status updates.
3. Add accessibility checks for every route and responsive screenshots for the primary customer and admin workflows.
4. Keep planned cases disabled or marked pending until the underlying feature is implemented.

## Requested Feature Test Cases

These cases cover the six requested features added to the current MVP.

| ID | Feature | Steps | Expected result |
|---|---|---|---|
| FEAT-001 | Bank slip upload payment | Add an item to the cart, open checkout, choose a manual payment method, upload a valid JPG/PNG/WEBP/PDF slip, and submit the order. | The order is created once with the uploaded slip, payment status is `slip_submitted`, and the admin Orders screen shows the slip with Confirm and Reject actions. |
| FEAT-002 | Product review system | Sign in as a customer, open a product detail page, choose a 1–5 star rating, enter review text, and submit. | The review is accepted, appears on the product page with the signed-in author name, and the product review count/rating updates. A guest cannot submit a review. |
| FEAT-003 | Product management details page | Sign in as an admin, open Admin > Products, create a product with category, name, image filename, description, price, SKU, and stock, then edit its details and save. | The new product appears in the catalog, edits persist after reload, and invalid required fields prevent saving with a useful validation error. |
| FEAT-004 | Stock management details | In Admin > Products, inspect the inventory summary, change a product stock value to a positive number, then change it to zero. | Catalog, low-stock, and out-of-stock counts are shown; stock changes persist; positive stock shows In stock and zero stock shows Out of stock. |
| FEAT-005 | Order tracker in cart | Add an item to the cart, select Track an order, enter a valid order number and checkout email, and submit. Repeat with an incorrect email. | The cart link opens the tracker; valid details show order status, items, total, and tracking number; incorrect email does not disclose the order. |
| FEAT-006 | Customizable footer social links | Set `VITE_SOCIAL_INSTAGRAM`, `VITE_SOCIAL_FACEBOOK`, and `VITE_SOCIAL_TIKTOK` in the UI environment, rebuild, and open the storefront footer. | Each social icon points to its configured URL, has an accessible label, and opens the configured destination without changing the application source. |
