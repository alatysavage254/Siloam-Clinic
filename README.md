# Siloam Dental & Eye Clinic Health Management System

A comprehensive MERN stack application for managing clinic operations including patient registration, doctor management, appointment booking, SMS notifications, and digital billing.

## Features

- **Patient Management**: Complete patient registration and record management
- **Doctor Management**: Doctor profiles with specializations (Dental/Eye)
- **Appointment Booking**: Schedule and manage patient appointments
- **SMS Notifications**: Automatic SMS confirmations via Africa's Talking API
- **Digital Billing**: PDF invoice generation with PDFKit
- **Admin Dashboard**: Comprehensive statistics and analytics
- **JWT Authentication**: Secure user authentication and authorization
- **Responsive Design**: Mobile-first design with TailwindCSS

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Axios
- **Backend**: Node.js, Express.js, JWT
- **Database**: MongoDB with Mongoose ODM
- **Package Manager**: pnpm
- **External Services**: Africa's Talking SMS API, PDFKit

## Project Structure

```
clinic-hms/
├── client/          # React frontend application
├── server/          # Express.js backend API
├── package.json     # Root package configuration
└── README.md        # Project documentation
```

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- MongoDB (local or cloud instance)
- Africa's Talking API account (for SMS)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clinic-hms
```

2. Install dependencies for all workspaces:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your actual configuration values
```

4. Start MongoDB service (if running locally)

## Development

Start both client and server in development mode:
```bash
pnpm dev
```

This will start:
- Client (React): http://localhost:5173
- Server (Express): http://localhost:5000

## Individual Commands

### Client (Frontend)
```bash
cd client
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Server (Backend)
```bash
cd server
pnpm dev          # Start with nodemon
pnpm start        # Start production server
```

## Environment Variables

Configure the following variables in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/clinic_hms
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
SMS_API_KEY=your_africastalking_api_key
SMS_USERNAME=your_africastalking_username
SMS_SENDER_ID=SILOAM
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Patients
- `POST /api/patients` - Register new patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID

### Doctors
- `POST /api/doctors` - Add new doctor
- `GET /api/doctors` - Get all doctors

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get appointments
- `PUT /api/appointments/:id/status` - Update appointment status

### Billing
- `POST /api/billing` - Create invoice
- `GET /api/billing/:id` - Get invoice

### Dashboard
- `GET /api/dashboard/stats` - Get clinic statistics

## Production Deployment

1. Build the client:
```bash
pnpm run build
```

2. Set production environment variables

3. Start the server:
```bash
pnpm start
```

## License

MIT License - see LICENSE file for details