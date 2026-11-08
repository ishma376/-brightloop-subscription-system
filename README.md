# Brightloop — Subscription Management System

**A full-stack, role-based subscription management platform built with React, TypeScript, Spring Boot, PostgreSQL, and Razorpay.**

Brightloop helps businesses manage products, subscription plans, customers, invoices, and payments through a centralized web application.

The platform includes dedicated workspaces for **Admin, Staff, and Customers**, supporting subscription management from plan creation to customer checkout, payment processing, and financial monitoring.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, CSS |
| Backend | Java 17, Spring Boot, Spring Security |
| Database | PostgreSQL |
| Authentication | JWT, Role-Based Access Control |
| Payment Gateway | Razorpay |
| Database Migration | Flyway |
| Invoice Generation | OpenPDF |
| API Testing | Postman |
| Version Control | Git and GitHub |

## Key Features

### Admin Portal

- Financial dashboard with invoiced, collected, and outstanding amounts.
- Create and manage products and subscription plans.
- Link subscription plans to products.
- Create Staff accounts.
- Manage customers and subscriptions.
- Monitor invoices, payments, and financial reports.

### Staff Portal

- Dedicated Staff Dashboard.
- Manage customer records.
- Monitor customer subscriptions and billing information.
- View invoices and record authorized payments.
- Track overdue invoices.
- Perform permitted subscription lifecycle actions.

### Customer Portal

- Customer registration and secure login.
- Browse available subscription plans.
- Subscribe through a self-service checkout.
- Automatically generate invoices for new subscriptions.
- Pay invoices using Razorpay.
- Access invoice history and download invoice PDFs.
- View outstanding invoice balances.

### Subscription and Payment Management

- Daily, weekly, monthly, and yearly billing plans.
- Subscription lifecycle management.
- Invoice status and payment tracking.
- Full and partial payment support in the application code.
- Payment verification through Razorpay.
- Subscription activation after verified full payment of the initial checkout invoice.

**Payment testing note:** Razorpay integration is intended to be demonstrated in Test Mode. Partial-payment behavior and edge cases should be validated before production use.

## How Brightloop Works

1. **Admin** creates a product and links it to a subscription plan.
2. **Customer** logs in and browses available subscription plans.
3. The customer selects a plan and initiates checkout.
4. Brightloop creates a subscription record and generates an invoice.
5. The customer pays through Razorpay.
6. The backend verifies the payment and updates the invoice balance.
7. Following verified full payment of the initial checkout invoice, the subscription is activated.
8. **Staff** monitors subscriptions, invoices, and payment activity.
9. **Admin** reviews financial summaries and reports.

## Project Structure

```text
brightloop/
├── backend/
│   ├── src/main/java/
│   │   └── com/brightloop/backend/
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── model/
│   │       ├── repository/
│   │       └── service/
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Run Locally

### Prerequisites

Install:

- Java 17
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ishma376/-brightloop-subscription-system.git
cd -brightloop-subscription-system
```

### 2. Configure PostgreSQL

Create a PostgreSQL database named:

```text
brightloop_db
```

The backend uses Flyway to manage database schema migrations.

### 3. Configure environment variables

The backend requires database and application credentials.

For Windows PowerShell, use the following pattern, replacing the placeholder values locally:

```powershell
$env:DB_PASSWORD = "YOUR_LOCAL_DATABASE_PASSWORD"
$env:JWT_SECRET = "YOUR_SECURE_JWT_SECRET"
$env:RAZORPAY_KEY_ID = "YOUR_RAZORPAY_TEST_KEY_ID"
$env:RAZORPAY_KEY_SECRET = "YOUR_RAZORPAY_TEST_KEY_SECRET"
```

The JWT secret must be sufficiently strong for the application's JWT configuration.

Never commit real secrets or production credentials.

### 4. Start the backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 5. Start the frontend

Open a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Security

Brightloop implements:

- JWT-based authentication.
- Role-based endpoint authorization.
- Password hashing.
- Customer-specific invoice access controls.
- Razorpay signature and captured-payment verification.
- Backend-side payment amount validation.

Before using the system in production, additional security, payment recovery, and reliability testing is recommended.

## Future Improvements

- Automated recurring billing.
- Payment reminders and notifications.
- Expanded subscription renewal handling.
- Additional automated integration tests.
- Production deployment and operational monitoring.
- More advanced analytics and reporting.

## Project Purpose

Brightloop was developed as a full-stack software engineering project to explore the practical challenges of subscription management, backend API development, database design, authentication, payment gateway integration, and multi-role web applications.

It demonstrates how frontend and backend technologies can work together to manage a real-world business process.

---

**Brightloop — Subscriptions, made simple.**