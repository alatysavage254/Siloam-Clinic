# Requirements Document

## Introduction

The Siloam Dental & Eye Clinic Health Management System is a comprehensive MERN stack web application designed to streamline clinic operations including patient registration, doctor management, appointment booking, SMS notifications, digital billing, and administrative oversight. The system will provide a complete digital solution for managing clinic workflows and patient care coordination.

## Glossary

- **HMS**: Health Management System - the complete web application
- **Patient_Portal**: Frontend interface for patient interactions
- **Admin_Dashboard**: Administrative interface for clinic management
- **Doctor_Module**: System component managing doctor information and availability
- **Appointment_System**: Booking and scheduling management component
- **Billing_Engine**: Invoice generation and financial tracking system
- **SMS_Service**: Automated notification system using Africa's Talking API
- **Authentication_Service**: JWT-based user authentication and authorization system

## Requirements

### Requirement 1

**User Story:** As a clinic receptionist, I want to register new patients with their complete information, so that I can maintain accurate patient records for medical and administrative purposes.

#### Acceptance Criteria

1. WHEN a receptionist submits patient registration data, THE HMS SHALL validate all required fields (fullName, phone, email, dateOfBirth, gender, address, nationalId) and store the patient record
2. THE HMS SHALL provide a REST endpoint POST /api/patients that accepts patient registration data
3. THE HMS SHALL provide a REST endpoint GET /api/patients that returns all registered patients
4. THE HMS SHALL provide a REST endpoint GET /api/patients/:id that returns specific patient details
5. WHERE medical notes are provided during registration, THE HMS SHALL store and associate them with the patient record

### Requirement 2

**User Story:** As a clinic administrator, I want to manage doctor profiles and their specializations, so that I can maintain accurate staff information and availability for appointment scheduling.

#### Acceptance Criteria

1. WHEN an administrator adds a new doctor, THE HMS SHALL store doctor information including name, specialization (Dental or Eye), phone, email, and available days
2. THE HMS SHALL provide a REST endpoint POST /api/doctors that accepts doctor registration data
3. THE HMS SHALL provide a REST endpoint GET /api/doctors that returns all registered doctors
4. THE HMS SHALL validate that specialization field contains only "Dental" or "Eye" values
5. THE HMS SHALL ensure doctor email addresses are unique within the system

### Requirement 3

**User Story:** As a patient, I want to book appointments with available doctors, so that I can schedule my medical consultations at convenient times.

#### Acceptance Criteria

1. WHEN a patient submits an appointment request, THE HMS SHALL create an appointment record with patientId, doctorId, date, time, reason, and initial status of "pending"
2. THE HMS SHALL provide a REST endpoint POST /api/appointments that accepts appointment booking data
3. THE HMS SHALL provide a REST endpoint GET /api/appointments that returns appointment listings
4. THE HMS SHALL provide a REST endpoint PUT /api/appointments/:id/status that allows status updates (pending, approved, rejected)
5. THE HMS SHALL validate that appointment dates are not in the past and doctors are available on requested days

### Requirement 4

**User Story:** As a clinic staff member, I want patients to receive automatic SMS confirmations when their appointments are approved, so that patients are properly notified of their scheduled visits.

#### Acceptance Criteria

1. WHEN an appointment status changes to "approved", THE HMS SHALL automatically send an SMS notification to the patient
2. THE HMS SHALL integrate with Africa's Talking API for SMS delivery
3. THE HMS SHALL format SMS messages as "Siloam Clinic: Your appointment with Dr {name} on {date} at {time} has been confirmed."
4. THE HMS SHALL handle SMS delivery failures gracefully without affecting appointment approval
5. THE HMS SHALL log SMS delivery attempts for audit purposes

### Requirement 5

**User Story:** As a clinic administrator, I want to generate digital invoices after patient consultations, so that I can provide professional billing documentation and track revenue.

#### Acceptance Criteria

1. WHEN billing information is submitted, THE HMS SHALL generate a PDF invoice containing clinic name, patient details, services, total amount, invoice number, and date
2. THE HMS SHALL provide a REST endpoint POST /api/billing that creates billing records and generates PDF invoices
3. THE HMS SHALL provide a REST endpoint GET /api/billing/:id that retrieves specific billing records
4. THE HMS SHALL use pdfkit library for PDF generation
5. THE HMS SHALL assign unique invoice numbers for each billing record

### Requirement 6

**User Story:** As a clinic administrator, I want to view comprehensive dashboard statistics, so that I can monitor clinic performance and make informed operational decisions.

#### Acceptance Criteria

1. THE HMS SHALL provide a REST endpoint GET /api/dashboard/stats that returns clinic statistics
2. THE HMS SHALL calculate and display total patients count
3. THE HMS SHALL calculate and display total doctors count
4. THE HMS SHALL calculate and display total appointments count
5. THE HMS SHALL calculate and display pending appointments count
6. THE HMS SHALL calculate and display total revenue from billing records

### Requirement 7

**User Story:** As a system user, I want secure authentication and authorization, so that only authorized personnel can access sensitive clinic data and operations.

#### Acceptance Criteria

1. THE HMS SHALL implement JWT-based authentication for all protected routes
2. THE HMS SHALL provide user login and registration functionality
3. THE HMS SHALL validate JWT tokens on protected API endpoints
4. THE HMS SHALL implement role-based access control for different user types
5. THE HMS SHALL securely hash and store user passwords

### Requirement 8

**User Story:** As a clinic staff member, I want a modern, professional healthcare dashboard interface that works seamlessly across all devices, so that I can efficiently manage clinic operations with a user experience comparable to leading SaaS applications.

#### Acceptance Criteria

1. THE HMS SHALL implement a modern design system using TailwindCSS with medical-focused color palette (white, soft blue, teal, gray)
2. THE HMS SHALL provide a professional dashboard layout with left sidebar navigation, top header bar, and responsive main content area
3. THE HMS SHALL ensure fully responsive design across desktop (1920px+), tablet (768px-1024px), and mobile (320px-768px) viewports
4. THE HMS SHALL implement a collapsible sidebar navigation with smooth animations and proper mobile menu handling
5. THE HMS SHALL use consistent spacing, typography hierarchy, and component design patterns throughout the application

### Requirement 9

**User Story:** As a clinic administrator, I want a comprehensive dashboard with visual analytics and key metrics, so that I can quickly assess clinic performance and make data-driven decisions.

#### Acceptance Criteria

1. THE HMS SHALL display dashboard cards showing Total Patients, Total Doctors, Appointments Today, Pending Appointments, and Revenue with appropriate icons
2. THE HMS SHALL implement interactive charts using Recharts library for appointment trends and revenue analytics
3. THE HMS SHALL provide real-time data updates with loading skeleton states during data fetching
4. THE HMS SHALL use professional card-based layouts with subtle shadows, hover effects, and proper visual hierarchy
5. THE HMS SHALL implement status badges with color coding (pending: yellow, approved: green, rejected: red) for appointment statuses

### Requirement 10

**User Story:** As a clinic staff member, I want clean, intuitive forms for patient registration and appointment booking, so that I can efficiently input data without errors or confusion.

#### Acceptance Criteria

1. THE HMS SHALL provide a two-column patient registration form card with labeled inputs, validation icons, and clear error messaging
2. THE HMS SHALL implement form validation with real-time feedback and submit buttons with loading states
3. THE HMS SHALL use consistent form input styling with proper focus states, placeholder text, and accessibility features
4. THE HMS SHALL provide appointment booking interface with doctor selector dropdown, date picker, time selector, and reason textarea
5. THE HMS SHALL display form submission feedback through toast notifications for success and error states

### Requirement 11

**User Story:** As a clinic administrator, I want professional doctor management and billing interfaces, so that I can maintain staff information and generate invoices that reflect our clinic's professional standards.

#### Acceptance Criteria

1. THE HMS SHALL display doctors in responsive grid cards showing name, specialization, contact info, and available days
2. THE HMS SHALL provide professional invoice layout with clinic header, patient details, services table, and total amount calculation
3. THE HMS SHALL implement PDF invoice generation with download functionality and proper formatting
4. THE HMS SHALL use styled data tables with sorting, filtering, and pagination for appointment and billing management
5. THE HMS SHALL provide hover effects, loading states, and smooth transitions throughout all interfaces

### Requirement 12

**User Story:** As a system user, I want consistent, reusable UI components and smooth interactions, so that the application feels polished and professional like modern healthcare software.

#### Acceptance Criteria

1. THE HMS SHALL implement reusable components including Navbar, Sidebar, Card, Table, FormInput, StatusBadge, and Button components
2. THE HMS SHALL provide smooth hover effects, loading skeletons, and transition animations throughout the interface
3. THE HMS SHALL implement accessible forms with proper ARIA labels, keyboard navigation, and screen reader support
4. THE HMS SHALL use consistent button states (default, hover, active, disabled) with appropriate visual feedback
5. THE HMS SHALL maintain clean typography hierarchy with proper font weights, sizes, and line heights for optimal readability