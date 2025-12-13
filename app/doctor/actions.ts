"use server";

import { db } from "@/db"; 
import { prescriptions } from "@/db/schema"; 
// Make sure "prescriptions" matches the export name in your schema.ts

export async function createPrescription(formData: FormData) {
  console.log("1. Server Action Started...");

  // 1. Extract Data
  const medicinesRaw = formData.get("medicines") as string;
  const patientId = formData.get("patient_id") as string;

  console.log("2. Data received:", { patientId, medicinesRaw });

  try {
    // 2. Parse the medicines JSON
    const medicinesData = JSON.parse(medicinesRaw);

    // 3. Insert into Database
    // IMPORTANT: We use 'await' so the server waits for the DB to finish
    console.log("3. Attempting DB Insert...");
    
    await db.insert(prescriptions).values({
        // Ensure these column names match your schema exactly!
        patientId: patientId, 
        medicines: medicinesData, // If your DB column is type 'json' or 'jsonb'
        // If your schema requires other fields (like 'doctorId' or 'date'), add them here:
        // createdAt: new Date(),
    });

    console.log("4. Saved to DB successfully!");
    return { success: true };

  } catch (error) {
    console.error("❌ DB ERROR:", error);
    // This will print the exact reason if the DB rejects the data
    return { success: false, error: "Failed to save" };
  }
}