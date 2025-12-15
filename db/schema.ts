import { pgTable, serial, text, json, timestamp, boolean, integer } from "drizzle-orm/pg-core";

// 1. PATIENTS (The Profile)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  nic: text("nic").notNull().unique(), // The ID used for login/lookup
  
  // Auth Info
  password: text("password").notNull(), 
  
  // Demographics
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"), 
  
  // Age Field
  age: integer("age"),

  // Medical Data
  bloodType: text("blood_type"), 
  
  // Allergies as text array
  allergies: text("allergies").array(), 
  
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. PRESCRIPTIONS (The History)
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  
  // Doctor Details
  doctorId: text("doctor_id").notNull(),     // Stores SLMC
  doctorName: text("doctor_name").notNull(), // Stores "Dr. Name"

  // Medicine Data
  medicines: json("medicines").notNull(),

  // NEW: Pharmacy Status Fields
  status: text("status").default("issued"), // 'issued' | 'dispensed'
  dispensedAt: timestamp("dispensed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. ACCESS LOGS (The Security Audit Trail)
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  doctorId: text("doctor_id").notNull(), 
  accessType: text("access_type").notNull(), 
  alertSent: boolean("alert_sent").default(false),
  accessedAt: timestamp("accessed_at").defaultNow(),
});

// 4. DOCTORS TABLE
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  slmcNumber: text("slmc_number").notNull().unique(), 
  specialization: text("specialization").notNull(),
  hospital: text("hospital"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. ACCESS REQUESTS (The Waiting Room Queue for Doctors)
export const accessRequests = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  doctorId: text("doctor_id").notNull(), 
  patientId: text("patient_id").notNull(), 
  patientName: text("patient_name").notNull(), 
  status: text("status").default("pending").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. PHARMACIES TABLE
export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  
  // Login Info
  licenseNumber: text("license_number").notNull().unique(), // This works like the SLMC/NIC
  password: text("password").notNull(),
  
  // Business Info
  name: text("name").notNull(), // e.g., "City Care Pharmacy"
  address: text("address").notNull(),
  phone: text("phone"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. MEDICAL REPORTS (PDFs uploaded by patients)
export const medicalReports = pgTable("medical_reports", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  fileName: text("file_name").notNull(),
  fileData: text("file_data").notNull(), // Stores the PDF as a huge text string (Base64)
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// 8. NOTIFICATIONS TABLE
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(), // Receiver
  message: text("message").notNull(),      // e.g., "Dr. Perera accessed your profile"
  type: text("type").default("access"),    // access | prescription | alert
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. NEW: PHARMACY QUEUE (Orders waiting room)
// ... existing imports

// 9. PHARMACY QUEUE (Updated)
export const pharmacyQueue = pgTable("pharmacy_queue", {
  id: serial("id").primaryKey(),
  pharmacyLicense: text("pharmacy_license").notNull(),
  patientNic: text("patient_nic").notNull(),
  patientName: text("patient_name").notNull(),
  
  // NEW COLUMN: Link to specific prescription
  prescriptionId: integer("prescription_id"), 

  status: text("status").default("pending"), 
  createdAt: timestamp("created_at").defaultNow(),
});