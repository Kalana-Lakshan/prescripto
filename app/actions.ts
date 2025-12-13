"use server";

// 1. Import the database connection we just verified
import { db } from "@/db/index";
import { prescriptions } from "@/db/schema";

// 2. Define the types for the data we expect
type Medicine = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

type PrescriptionData = {
  patientNic: string;
  medicines: Medicine[];
};

// 3. The Server Action Function
// In actions.ts
export async function createPrescription(formData: FormData) {
  console.log("Server Action Started..."); // You should see this in VS Code now

  const patientId = formData.get("patient_id") as string;
  const medicinesRaw = formData.get("medicines") as string;
  
  // PARSE THE JSON ARRAY
  const medicines = JSON.parse(medicinesRaw); 

  console.log("Saving medicines:", medicines);

  // ... Your DB Logic here ...
  // await db.insert( prescriptions ).values(...)
  
  console.log("Saved to DB successfully!");
}