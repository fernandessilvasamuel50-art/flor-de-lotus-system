# Flor de Lótus System

A full-stack appointment scheduling system built for service professionals.

The platform allows businesses to manage clients, services, availability and appointments through an administrative dashboard, while customers can independently view available dates and times and schedule their appointments online.

## Features

* Admin authentication
* Client management
* Service management
* Administrative dashboard
* Interactive appointment calendar
* Availability management
* Online appointment scheduling
* Appointment confirmation
* Appointment editing and cancellation
* Appointment history
* Customer data management
* Automated email notifications
* Email updates when an appointment status changes
* WhatsApp/Twilio integration
* Responsive web interface

## Automated Notifications

The system automatically communicates important appointment updates to customers.

For example, when an appointment is confirmed or its status is updated, the customer can receive an email notification containing the updated appointment information.

## Tech Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* FullCalendar

### Backend

* NestJS 11
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Passport
* bcrypt
* Nodemailer
* Twilio
* class-validator

### Development & Testing

* Jest
* Supertest
* ESLint
* Prettier
* Git
* GitHub

## Architecture

The application is divided into independent frontend and backend layers.

The **frontend** is responsible for the user interface, appointment calendar and interactions with the scheduling system.

The **backend** exposes the application's API and handles authentication, business rules, appointment management, persistence and external integrations.

PostgreSQL is used as the relational database, with Prisma ORM managing database access and data models.

## Project Evolution

Flor de Lótus System was the original scheduling platform that later served as the foundation for the development of **Agendaclinte**.

The experience gained while developing this project helped evolve the concept into a more complete SaaS platform, introducing features such as multi-business management, website customization, a visual Studio and public website publishing.

## Author

**Samuel Fernandes Silva**

Software Engineering Student & Web Developer

* GitHub: github.com/fernandessilvasamuel50-art
* LinkedIn: linkedin.com/in/samuel-fernandes-silva-3863b540a
