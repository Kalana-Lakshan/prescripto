import { pgTable, serial, text, json, timestamp, boolean } from "drizzle-orm/pg-core";

// 1. PATIENTS (The Profile)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  nic: text("nic").notNull().unique(), // The ID used for login/lookup
  
  // Auth Info (Simple password for now)
  password: text("password").notNull(), 
  
  // Demographics
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"), // Used for SMS notifications
  
  // Medical Data (Doctor Editable)
  bloodType: text("blood_type"), 
  allergies: json("allergies"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. PRESCRIPTIONS (The History)
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(), // Links to patients.nic
  medicines: json("medicines").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. ACCESS LOGS (The Security Audit Trail)
// Every time a doctor opens a file, we save a row here.
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  doctorId: text("doctor_id").notNull(), // For now, can be "Dr. Smith"
  
  accessType: text("access_type").notNull(), // "QR_SCAN" or "MANUAL_OVERRIDE"
  
  // If Manual, we flag it to send an alert
  alertSent: boolean("alert_sent").default(false),
  
  accessedAt: timestamp("accessed_at").defaultNow(),
});

// 4. DOCTORS TABLE
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  
  // Login & Identity
  name: text("name").notNull(),
  email: text("email").notNull().unique(), // Used for login
  password: text("password").notNull(),
  
  // Professional Details
  slmcNumber: text("slmc_number").notNull().unique(), // The ID for the QR Code
  specialization: text("specialization").notNull(), // e.g., "Cardiologist"
  hospital: text("hospital"), // e.g., "National Hospital"
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ... existing tables ...

// 5. ACCESS REQUESTS (The Waiting Room Queue)
export const accessRequests = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  doctorId: text("doctor_id").notNull(), // The Doctor receiving the request
  patientId: text("patient_id").notNull(), // The Patient requesting
  patientName: text("patient_name").notNull(), // Stored for quick display
  
  // Status: "pending" (waiting), "active" (in consultation), "completed"
  status: text("status").default("pending").notNull(), 
  
  createdAt: timestamp("created_at").defaultNow(),
});