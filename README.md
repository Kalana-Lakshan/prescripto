# 🏥 Prescripto - Digital Prescription & Healthcare Management System

<p align="center">
  <img src="./public/dashboard.png" alt="Prescripto Dashboard" />
</p>

Prescripto is a modern, full-stack web application designed to bridge the gap between Patients, Doctors, and Pharmacies. It digitizes the traditional prescription workflow, reducing errors, improving patient safety via allergy alerts, and streamlining pharmacy operations through a real-time queue system.

Built with Next.js 16 (App Router), TypeScript, Drizzle ORM, and PostgreSQL.

Live website - https://prescripto-hazel-rho.vercel.app/

📑 Table of Contents
Overview

Key Features

Tech Stack

System Architecture & Workflow

Database Schema

Getting Started

Project Structure

Future Roadmap

License

🔭 Overview
In traditional healthcare systems, handwritten prescriptions can be illegible, leading to medication errors. Furthermore, patients often lose physical records, and doctors lack visibility into a patient's dispensing history.

Prescripto solves these problems by providing:

For Doctors: A digital interface to view patient history and issue prescriptions with safety checks (allergy warnings).

For Patients: A centralized dashboard to view medical history, prescriptions, and upload lab reports.

For Pharmacies: A real-time queue management system to process and dispense incoming digital orders efficiently.

🌟 Key Features
👨‍⚕️ Doctor Portal
Patient Lookup: Search for patients using their National Identity Card (NIC) number.

Digital Prescribing: Create prescriptions with specific dosages, frequencies (TDS, BD, etc.), and durations.

Safety Alerts: Automatic Critical Allergy Warnings (e.g., Peanuts, Penicillin) displayed prominently before prescribing.

Medical History: View the patient's full timeline of past prescriptions and dispensed medicines.

Lab Report Access: View PDF medical reports uploaded by the patient.

👤 Patient Dashboard
Secure Access: Personal login to view health records.

Prescription History: A collapsible, detailed view of all past prescriptions, including the prescribing doctor and dispensing status.

Real-time Status: See whether a prescription is "Pending" or "Dispensed."

Document Management: Upload and store medical reports (PDF format) securely.

Notifications: View access logs and security alerts.

🏥 Pharmacy Operations
Real-time Queue: Live view of incoming prescription orders assigned to the pharmacy.

Order Processing: Detailed view of the prescription to ensure correct dispensing.

Dispensing History: A tracked record of all completed orders with precise timestamps.

Inventory Logic: (Foundation laid) Mark items as dispensed to close the loop.

💻 Tech Stack
Frontend
Framework: Next.js 16 (App Router)

Language: TypeScript

Styling: Tailwind CSS

UI Components: shadcn/ui (based on Radix UI)

Icons: Lucide React

Toasts: Sonner

Backend
Server Actions: Next.js Server Actions for mutations and data fetching.

Database: PostgreSQL (Compatible with Neon/Supabase/Local).

ORM: Drizzle ORM for type-safe database interactions.

Validation: Zod (implied usage for form validation).

🔄 System Architecture & Workflow
The system relies on a Centralized Database where all three actors interact in real-time.

Prescription Creation:

Doctor logs in -> Searches Patient (NIC) -> Fills Prescription Form.

System checks Allergies -> Saves data to prescriptions table -> Creates entry in pharmacy_queue.

Patient View:

Patient logs in -> Fetches data via Server Actions -> Sees new prescription in "Pending" status.

Dispensing Process:

Pharmacy logs in -> Sees order in "Active Queue."

Pharmacist clicks "Process" -> Reviews details -> Clicks "Dispense."

System updates pharmacy_queue status to completed and prescriptions status to dispensed.

Timestamps (updatedAt, dispensedAt) are recorded.

🗄️ Database Schema
The project uses a relational schema defined in db/schema.ts. Key tables include:

patients: Stores demographics, authentication, and the critical allergies array.

doctors: Stores SLMC registration, specialization, and auth details.

prescriptions: The core record linking patientId, doctorId, and a JSON object for medicines.

pharmacy_queue: Manages the lifecycle of an order (pending -> completed). It links to a specific prescriptionId.

medical_reports: Stores Base64 strings or URLs for patient-uploaded PDFs.

notifications: Stores system alerts and access logs.

(See db/schema.ts for the full Drizzle definition)

🚀 Getting Started
Follow these steps to set up the project locally.

Prerequisites
Node.js (v18 or higher)

PostgreSQL database (Local or Cloud like Neon.tech)

Installation
Clone the Repository
```bash
git clone https://github.com/your-username/prescripto.git
cd prescripto
```

Install Dependencies
```bash
npm install
```

Environment Setup Create a .env file in the root directory:
```env
# Connection string to your PostgreSQL database
DATABASE_URL="postgresql://user:password@localhost:5432/prescripto_db"
```

Database Migration Push the schema to your database using Drizzle Kit:
```bash
npx drizzle-kit push
```

(Or npm run db:push if configured in package.json)

Run the Development Server
```bash
npm run dev
```

Access the App
```text
http://localhost:3000
```

📂 Project Structure
```bash
prescripto/
├── app/                    # Next.js App Router
│   ├── doctor/             # Doctor portal routes & actions
│   ├── patient/            # Patient dashboard routes & actions
│   ├── pharmacy/           # Pharmacy queue routes & actions
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI components (Button, Card, Input)
│   └── ...
├── db/
│   ├── index.ts            # DB connection setup
│   └── schema.ts           # Drizzle schema definitions
├── lib/
│   └── utils.ts            # Helper functions (clsx, twMerge)
├── public/                 # Static assets
└── drizzle.config.ts       # Drizzle configuration
```

🔮 Future Roadmap
📱 QR Code Integration: Generate QR codes for prescriptions to allow instant scanning at pharmacies.

🤖 AI Drug Interactions: Integrate with external APIs to check for drug-drug interactions automatically.

🔔 SMS/Email Notifications: Integrate Twilio or n8n to send SMS alerts when prescriptions are issued or dispensed.

📊 Analytics Dashboard: Graphs for doctors to visualize patient health trends over time.


