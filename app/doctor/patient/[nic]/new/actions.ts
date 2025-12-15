"use server";

import { db } from "@/db";
import { patients, doctors, prescriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Fetch Patient Details (Name + Allergies)
export async function getPatientDetails(nic: string) {
  try {
    const result = await db.select({ 
        name: patients.name,
        allergies: patients.allergies // Fetch allergies array
      })
      .from(patients)
      .where(eq(patients.nic, nic))
      .limit(1);
      
    // Return details or default
    return result[0] || { name: nic, allergies: [] };
  } catch (e) {
    console.error("Error fetching patient:", e);
    return { name: nic, allergies: [] };
  }
}

// 2. Save Prescription Logic (Unchanged)
export async function savePrescription(patientNic: string, medicines: any[], doctorSlmc: string) {
  try {
    const doctorResult = await db.select({ name: doctors.name })
      .from(doctors)
      .where(eq(doctors.slmcNumber, doctorSlmc))
      .limit(1);

    const doctorName = doctorResult[0]?.name || "Unknown Doctor";

    await db.insert(prescriptions).values({
      patientId: patientNic,
      doctorId: doctorSlmc,
      doctorName: doctorName,
      medicines: medicines, 
      status: "pending",
      createdAt: new Date(),
    });

    revalidatePath(`/doctor/patient/${patientNic}`); 
    revalidatePath(`/patient/dashboard/${patientNic}`);
    
    return { success: true };

  } catch (error) {
    console.error("Prescription Error:", error);
    return { success: false, error: "Failed to save prescription." };
  }
}