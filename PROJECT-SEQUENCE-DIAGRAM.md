# Mya Hay Thar Ecommerce - Complete Sequence Diagrams

This document describes the current MVP behavior across the React storefront, Laravel API, database, browser storage, and admin dashboard. `Implemented` means it is represented by the current routes/components/API. `Planned` means it is in `FEATURES.md` or `srs.txt` but is not part of the current end-to-end flow.

## System Participants

```mermaid
flowchart LR
    Customer[Customer browser]
    Storefront[React storefront]
    Storage[Browser localStorage]
    API[Laravel JSON API]
    Auth[Sanctum token auth]
    DB[(MySQL or configured DB)]
    Files[Public storage for payment slips]
    Admin[Admin browser]
    Customer --> Storefront
    Storefront --> Storage
    Storefront --> API
    Admin --> API
    API --> Auth
    API --> DB
    API --> Files
```

## 1. Storefront Discovery and Product Browsing (Implemented)

```mermaid
sequenceDiagram
    actor Customer
    participant UI as React storefront
    participant API as Laravel API
    participant DB as Database

    Customer->>UI: Open homepage
    UI->>API: GET /categories and GET /products
    API->>DB: Read categories and products
    DB-->>API: Catalog data
    API-->>UI: JSON catalog
    UI-->>Customer: Hero, bestsellers, featured products, blind-box promotion

    Customer->>UI: Open Shop
    UI->>API: GET /products?search, category, stock, sort
    API->>DB: Apply filters and ordering
    DB-->>API: Matching products
    API-->>UI: Product list
    UI-->>Customer: Product grid and filter controls

    Customer->>UI: Open product detail
    UI->>API: GET /products/{slug}
    API->>DB: Read product, category, and reviews
    DB-->>API: Product detail
    API-->>UI: Product, images, price, stock, reviews
    UI-->>Customer: Detail page
```

## 2. Cart, Wishlist, Currency, and Accessibility (Implemented)

```mermaid
sequenceDiagram
    actor Customer
    participant UI as React storefront
    participant Storage as Browser localStorage
    participant API as Laravel API
    participant DB as Database

    Customer->>UI: Add product to cart
    UI->>Storage: Save product and quantity
    UI-->>Customer: Cart count and toast update
    Customer->>UI: Change quantity or remove product
    UI->>Storage: Persist cart change
    UI-->>Customer: Recalculate subtotal, shipping, and total

    Customer->>UI: Select currency
    UI->>Storage: Persist currency preference
    UI-->>Customer: Convert displayed prices and threshold

    Customer->>UI: Save product to wishlist
    alt Logged-in member
        UI->>API: POST /wishlist
        API->>DB: Create or update wishlist item
        DB-->>API: Saved item
        API-->>UI: Wishlist response
    else Guest
        UI->>Storage: Save wishlist item locally
    end
    UI-->>Customer: Updated wishlist state

    Customer->>UI: Submit product review
    UI->>API: POST /products/{product}/reviews with Sanctum token
    API->>DB: Validate member purchase and save review
    DB-->>API: Review result
    API-->>UI: Review response

    Customer->>UI: Change accessibility setting
    UI->>Storage: Save reduce motion, text size, contrast, or reading mask
    UI-->>Customer: Apply preference to storefront
```

## 3. Authentication and Account Lifecycle (Implemented)

```mermaid
sequenceDiagram
    actor Customer
    participant UI as React storefront
    participant API as Laravel API
    participant Auth as Sanctum
    participant DB as Database
    participant Storage as Browser localStorage

    Customer->>UI: Register or sign in
    UI->>API: POST /register or POST /login
    API->>DB: Validate credentials and read or create user
    API->>Auth: Issue personal access token
    Auth-->>API: Token
    API-->>UI: User and token
    UI->>Storage: Save auth token
    UI-->>Customer: Account page or requested redirect

    Customer->>UI: Open member account
    UI->>API: GET /me, GET /orders, GET /wishlist
    API->>Auth: Validate Sanctum token
    API->>DB: Read member data
    DB-->>API: Orders and wishlist
    API-->>UI: Account data

    Customer->>UI: Sign out
    UI->>API: POST /logout
    API->>Auth: Revoke token
    UI->>Storage: Remove auth token

    Customer->>UI: Open guest account
    UI->>Storage: Read X-Guest-Token
    UI->>API: GET /guest/me and GET /guest/orders
    API->>DB: Resolve guest token and read orders
    API-->>UI: Guest profile and orders

    Customer->>UI: Upgrade guest account
    UI->>API: POST /guest/upgrade with password
    API->>DB: Create member, migrate guest orders, delete guest account
    API->>Auth: Issue member token
    API-->>UI: User and token
    UI->>Storage: Replace guest session with member session
```

## 4. Checkout and Order Creation (Implemented)

```mermaid
sequenceDiagram
    actor Customer
    participant UI as React checkout
    participant API as Laravel API
    participant DB as Database
    participant Files as Public file storage
    participant Storage as Browser localStorage

    Customer->>UI: Open checkout with cart
    UI->>API: GET /payment-methods
    API-->>UI: Card and manual payment methods
    UI-->>Customer: Contact, shipping, payment, promo, and summary fields

    Customer->>UI: Submit order
    UI->>API: POST /orders with items, address, currency, payment method
    API->>DB: Validate request and load products
    API->>DB: Verify stock and calculate subtotal
    API->>DB: Apply 10 percent discount for 2 or more items
    API->>DB: Apply discount code, if valid
    API->>DB: Calculate free-shipping threshold by currency

    alt Manual payment method
        API->>Files: Store uploaded payment slip
        API->>DB: Create pending order with slip_submitted status
    else Demo card method
        API->>DB: Create processing order with no real charge
    end

    API->>DB: Create guest account when customer is not authenticated
    API->>DB: Create order and order items
    API->>DB: Decrement stock and mark zero stock unavailable
    DB-->>API: Order with items and product data
    API-->>UI: Order, and guest token when applicable
    UI->>Storage: Save guest session and recent order
    UI->>Storage: Clear cart
    UI-->>Customer: Order confirmation page
```

## 5. Order Tracking and Guest Account Claim (Implemented)

```mermaid
sequenceDiagram
    actor Customer
    participant UI as React tracking page
    participant API as Laravel API
    participant DB as Database
    participant Storage as Browser localStorage

    Customer->>UI: Enter order number and email
    UI->>API: GET /orders/track
    API->>DB: Find matching order and items
    DB-->>API: Order status, tracking, items, total
    API-->>UI: Tracking result
    UI-->>Customer: Status and shipment details

    Customer->>UI: Claim guest order with password
    UI->>API: POST /orders/claim-account
    API->>DB: Verify order number, email, and unlinked state
    API->>DB: Create member and migrate all matching guest orders
    API->>Auth: Issue token
    API-->>UI: User and token
    UI->>Storage: Save member token
    UI-->>Customer: Member account with order history
```

## 6. Admin Dashboard and Operations (Implemented)

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin React dashboard
    participant API as Laravel API
    participant Auth as Sanctum plus admin middleware
    participant DB as Database
    participant Files as Public file storage

    Admin->>UI: Sign in and open /admin
    UI->>API: GET /admin/dashboard
    API->>Auth: Require authenticated admin
    API->>DB: Aggregate revenue, orders, customers, stock alerts, top products
    DB-->>API: KPI and report data
    API-->>UI: Dashboard data

    Admin->>UI: Open orders
    UI->>API: GET /admin/orders with status or payment filters
    API->>DB: Read orders and payment slips
    API-->>UI: Order queue
    Admin->>UI: Change status or add tracking
    UI->>API: PATCH /admin/orders/{order}
    API->>DB: Update order status or tracking number
    DB-->>API: Updated order
    API-->>UI: Refresh queue

    Admin->>UI: Confirm or reject manual payment
    UI->>API: POST /confirm-payment or /reject-payment
    API->>DB: Update payment status and rejection reason
    API-->>UI: Refresh queue
    Admin->>UI: Refund order
    UI->>API: POST /admin/orders/{order}/refund
    API->>DB: Mark refunded and restore inventory
    API-->>UI: Refresh queue

    Admin->>UI: Manage product stock
    UI->>API: GET and PATCH /admin/products
    API->>DB: Read or update product stock and in_stock flag
    API-->>UI: Updated catalog

    Admin->>UI: Search customers or view newsletter
    UI->>API: GET /admin/customers or /admin/newsletter
    API->>DB: Read CRM and subscriber data
    API-->>UI: Customer and subscriber lists

    Admin->>UI: Manage discount codes
    UI->>API: GET, POST, PATCH, or DELETE /admin/discounts
    API->>DB: Persist code, percentage, limits, and expiry
    API-->>UI: Updated discount list

    Admin->>UI: Open sales or product reports
    UI->>API: GET /admin/reports/sales or /admin/reports/products
    API->>DB: Aggregate reporting data
    API-->>UI: Report data
```

## 7. Planned Flows and Current Boundary

These are requirements in the SRS or feature list that do not currently have a complete implemented sequence in the repository:

- Automatic location-based currency detection.
- Product variants such as size, color, and style.
- Digital gift cards and gift-card redemption.
- Shipment email notifications after tracking is added.
- Homepage and blog CMS.
- Saved-address CRUD; the current account screen displays a placeholder address.
- Full refund and return policy workflow beyond the current admin refund endpoint.
- Payment gateway integration; card checkout is explicitly demo-only.
- Real-time admin alerts, conversion rate, taxes, customer support tickets, and customizable reports.
- Sitewide sale banners, homepage carousel management, and blog publishing.
- Legal policy pages and exportable newsletter download.
``