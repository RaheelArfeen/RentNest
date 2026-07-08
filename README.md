# RentNest 🏠

> Find & List Rental Properties with Ease

RentNest is a backend REST API for a rental property marketplace. Landlords can list properties and manage rental requests, tenants can browse listings, submit rental requests, pay via Stripe, and leave reviews. Admins oversee the entire platform.

## Links

| Item | Link |
|---|---|
| Live API | [https://rent-nest-rho.vercel.app/](https://rent-nest-rho.vercel.app/) |
| API Documentation (Postman) | [https://documenter.getpostman.com/view/54890787/2sBY4JxiAc](https://documenter.getpostman.com/view/54890787/2sBY4JxiAc) |
| GitHub Repository | https://github.com/RaheelArfeen/RentNest |

## Admin Credentials

```
Email    : admin@rentnest.com
Password : admin123
```

## Tech Stack

- **Runtime:** Node.js + Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** JWT (jsonwebtoken) + bcrypt password hashing
- **Validation:** Zod
- **Payments:** Stripe
- **Security:** helmet, express-rate-limit, CORS

## Roles

| Role | Permissions |
|---|---|
| **Tenant** | Browse listings, submit rental requests, pay for approved rentals, leave reviews after completed rentals, manage profile |
| **Landlord** | Create/edit/delete own listings, approve/reject rental requests, mark rentals completed |
| **Admin** | View/ban/unban users, view all properties & rentals, manage categories |

Users choose **TENANT** or **LANDLORD** at registration. The admin account is created by the seed script.

## Rental Lifecycle

```
PENDING ──(landlord approves)──▶ APPROVED ──(payment confirmed)──▶ ACTIVE ──(landlord completes)──▶ COMPLETED ──▶ tenant can review
   └──(landlord rejects)──▶ REJECTED
```

When a payment is confirmed the property automatically becomes unavailable; when the rental is completed it becomes available again.

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/RaheelArfeen/RentNest.git
cd RentNest
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host:5432/rentnest?sslmode=require"
PORT=5050
JWT_SECRET=<any long random string>
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Database

```bash
npx prisma migrate dev   # apply migrations & generate the client
npm run seed             # create admin user + default categories
```

### 4. Run

```bash
npm run dev     # development (ts-node-dev, auto-restart)
npm run build   # compile TypeScript to dist/
npm start       # run compiled build
```

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register as TENANT or LANDLORD |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Logged in | Current user |
| PATCH | `/api/auth/me` | Logged in | Update name/phone/password |

### Categories
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/categories` | Admin | Create category |
| PATCH | `/api/categories/:id` | Admin | Rename category |
| DELETE | `/api/categories/:id` | Admin | Delete category (if unused) |

### Properties
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | Browse with filters & pagination |
| GET | `/api/properties/:id` | Public | Property details with reviews |
| POST | `/api/landlord/properties` | Landlord | Create listing |
| PUT | `/api/landlord/properties/:id` | Landlord (owner) | Update listing / availability |
| DELETE | `/api/landlord/properties/:id` | Landlord (owner) | Remove listing |

Filters for `GET /api/properties`: `location`, `minPrice`, `maxPrice`, `categoryId`, `searchTerm`, `isAvailable`, `page`, `limit`.

### Rental Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/rentals` | Tenant | Submit rental request |
| GET | `/api/rentals` | Tenant | Own request history |
| GET | `/api/rentals/:id` | Involved parties | Request details |
| GET | `/api/landlord/requests` | Landlord | Requests for own properties |
| PATCH | `/api/landlord/requests/:id` | Landlord (owner) | Approve / reject (`{"status":"APPROVED"}`) |
| PATCH | `/api/landlord/requests/:id/complete` | Landlord (owner) | Mark ACTIVE rental COMPLETED |

### Payments (Stripe)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create` | Tenant | Create payment intent for APPROVED rental |
| POST | `/api/payments/confirm` | Logged in | Verify payment with Stripe, activate rental |
| GET | `/api/payments` | Logged in | Payment history |
| GET | `/api/payments/:id` | Involved parties | Payment details |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | Tenant | Review a property after a COMPLETED rental |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | All users (`?role=`, `?status=` filters) |
| PATCH | `/api/admin/users/:id` | Admin | Ban/unban (`{"status":"BANNED"}`) |
| GET | `/api/admin/properties` | Admin | All properties |
| GET | `/api/admin/rentals` | Admin | All rental requests (`?status=` filter) |

## Response Format

Success:
```json
{ "success": true, "message": "...", "data": { } }
```

Error:
```json
{ "success": false, "message": "...", "errorDetails": null }
```

Validation errors include per-field details:
```json
{
  "success": false,
  "message": "Validation failed",
  "errorDetails": [{ "field": "email", "message": "Invalid email address" }]
}
```

## Testing Payments

1. `POST /api/payments/create` with an approved rental → copy `transactionId` (`pi_...`)
2. Simulate the card payment (test mode):
   `POST https://api.stripe.com/v1/payment_intents/{pi_id}/confirm` with Basic Auth (`sk_test_` key as username) and form fields `payment_method=pm_card_visa`, `return_url=https://example.com`
3. `POST /api/payments/confirm` with `{ "transactionId": "pi_..." }` → payment COMPLETED, rental ACTIVE

## Database Schema

Six models (see [prisma/schema.prisma](prisma/schema.prisma)):

- **User** — name, email, password (hashed), phone, role (TENANT/LANDLORD/ADMIN), status (ACTIVE/BANNED)
- **Category** — property types (Apartment, House, Studio, ...)
- **Property** — listing details, price, amenities, images, availability; belongs to a landlord and a category
- **RentalRequest** — tenant ↔ property, date range, status (PENDING/APPROVED/REJECTED/ACTIVE/COMPLETED)
- **Payment** — Stripe transaction id, amount, provider, status (PENDING/COMPLETED/FAILED), paidAt; one per rental request
- **Review** — rating (1–5) + comment; tenant ↔ property, only after a completed rental
