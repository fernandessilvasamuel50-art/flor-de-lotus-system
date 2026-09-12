# Sublime Pés

A full-stack appointment scheduling platform for professional foot care, podology and wellness services.

Sublime Pés allows the business to manage services, customers, availability and appointments through an administrative dashboard, while customers can browse available services, select dates and times, and request appointments online.

The project was built with **Next.js, React, TypeScript, NestJS, Prisma and PostgreSQL**.

---

## Preview

### Home

A responsive public website where customers can learn about the business and access the online scheduling flow.

![Sublime Pés Home](docs/screenshots/home.png)

### Online Scheduling

Customers can select one or more services, choose an available date and time, provide their information and submit an appointment request directly through the platform.

![Online Scheduling](docs/screenshots/scheduling.png)

### Customer Dashboard

Authenticated customers can manage their profile, view upcoming appointments and access their appointment history.

![Customer Dashboard](docs/screenshots/customer-dashboard.png)

### Admin Dashboard

The administrative dashboard provides an overview of daily and weekly appointments, pending requests, registered customers, financial indicators and upcoming appointments.

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

---

## Features

### Customer Experience

* Online appointment scheduling
* Service selection
* Available date and time selection
* Customer account authentication
* Customer profile management
* Upcoming appointment visualization
* Appointment history
* Appointment cancellation and updates
* Responsive interface

### Business Management

* Administrative authentication
* Administrative dashboard
* Customer management
* Service management
* Appointment management
* Interactive calendar
* Availability management
* Pending appointment requests
* Appointment confirmation
* Appointment editing and cancellation
* Appointment history
* Financial overview and indicators

### Notifications

The system automatically communicates relevant appointment updates to customers.

Customers can receive email notifications when important changes occur, such as:

* Appointment request received
* Appointment confirmation
* Appointment rescheduling
* Appointment cancellation
* No-show registration

The backend also includes integrations for email and messaging services.

---

## Tech Stack

### Frontend

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **FullCalendar**

### Backend

* **NestJS 11**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **JWT Authentication**
* **Passport**
* **bcrypt**
* **Nodemailer**
* **Twilio**
* **class-validator**
* **date-fns**

### Development & Testing

* **Jest**
* **Supertest**
* **ESLint**
* **Prettier**
* **Git**
* **GitHub**

---

## Architecture

Sublime Pés follows a separated frontend and backend architecture.

### Frontend

The frontend is built with Next.js and React and is responsible for:

* Public business pages
* Customer interactions
* Appointment scheduling
* Customer dashboard
* Administrative interfaces
* Calendar visualization
* Communication with the backend API

### Backend

The backend is built with NestJS and is responsible for:

* Authentication and authorization
* Business rules
* Customer management
* Service management
* Appointment management
* Availability validation
* Database operations
* Email notifications
* External service integrations

### Database

PostgreSQL is used as the relational database.

Prisma ORM provides the application data layer and handles communication between the NestJS backend and PostgreSQL.

---

## Authentication

Authentication is implemented using **JWT and Passport**.

Passwords are securely hashed using **bcrypt** before being stored.

The application contains authenticated areas for both customers and administrators.

---

## Appointment Flow

A typical appointment follows this flow:

1. The customer selects one or more services.
2. The customer chooses a date.
3. The system displays available times.
4. The customer selects an available time.
5. Customer information is submitted.
6. An appointment request is created.
7. The business can review and confirm the request.
8. The customer receives an update about the appointment.
9. The appointment becomes available in both customer and administrative interfaces.

---

## Project Structure

```text
flor-de-lotus-system/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── test/
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── public/
│   └── package.json
│
├── docs/
│   └── screenshots/
│       ├── home.png
│       ├── scheduling.png
│       ├── customer-dashboard.png
│       └── admin-dashboard.png
│
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* PostgreSQL

### Clone the repository

```bash
git clone https://github.com/fernandessilvasamuel50-art/flor-de-lotus-system.git
cd flor-de-lotus-system
```

### Backend

```bash
cd backend
npm install
```

Configure the required environment variables in your local `.env` file.

Then generate the Prisma client:

```bash
npx prisma generate
```

Run the backend in development mode:

```bash
npm run start:dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

The application requires environment variables for database access, authentication, public URLs and notification services.

```env
DATABASE_URL=
JWT_SECRET=

# Frontend/backend URLs
FRONTEND_URL=
CORS_ORIGINS=
NEXT_PUBLIC_API_URL=

# Email configuration
BREVO_API_KEY=
MAIL_FROM=
MAIL_FROM_NAME=Sublime Pés
ADMIN_NOTIFICATION_EMAIL=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

Real credentials are not included in the repository.

---

## Testing

The backend includes support for unit and end-to-end testing.

```bash
npm run test
```

For end-to-end tests:

```bash
npm run test:e2e
```

For coverage:

```bash
npm run test:cov
```

---

## Project Status

Sublime Pés is a functional scheduling system for professional foot care services, with public scheduling, customer access and administrative management.

---

## Author

**Samuel Fernandes Silva**

Software Engineering Student & Web Developer

Ariquemes, Rondônia, Brazil

* GitHub: github.com/fernandessilvasamuel50-art
* LinkedIn: linkedin.com/in/samuel-fernandes-silva-3863b540a

Open to **remote, on-site and relocation opportunities** in software development.
