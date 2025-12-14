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
  
  // NEW: Age Field (Optional)
  age: integer("age"),

  // Medical Data
  bloodType: text("blood_type"), // Optional by default
  
  // Changed from json to array for better compatibility with text lists
  allergies: text("allergies").array(), 
  
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

// 5. ACCESS REQUESTS (The Waiting Room Queue)
export const accessRequests = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  doctorId: text("doctor_id").notNull(), 
  patientId: text("patient_id").notNull(), 
  patientName: text("patient_name").notNull(), 
  status: text("status").default("pending").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});