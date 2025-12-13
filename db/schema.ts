import { pgTable, serial, text, json, timestamp } from "drizzle-orm/pg-core";

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  
  // This is the important part:
  medicines: json("medicines").notNull(), 
  
  createdAt: timestamp("created_at").defaultNow(),
});