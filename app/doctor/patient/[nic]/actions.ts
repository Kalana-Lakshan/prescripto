"use server";

import { db } from "@/db";
import { patients, prescriptions,medicalReports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache"; // Import this to update other pages instantly
import { unstable_noStore as noStore } from "next/cache";

// 1. Fetch Patient Profile & History (For Doctor View)
export async function getPatientProfile(nic: string) {
  noStore();

  try {
    // 1. Get Personal Info
    const patientData = await db.select()
      .from(patients)
      .where(eq(patients.nic, nic))
      .limit(1);

    if (patientData.length === 0) return null;

    // 2. Get Past Prescriptions
    const history = await db.select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, nic))
      .orderBy(desc(prescriptions.createdAt));

    // 3. Get Medical Reports (CRITICAL STEP)
    const reports = await db.select()
      .from(medicalReports)
      .where(eq(medicalReports.patientId, nic))
      .orderBy(desc(medicalReports.uploadedAt));

    return {
      patient: patientData[0],
      history: history,
      reports: reports || [] // Ensure we return the array
    };

  } catch (error) {
    console.error("Error fetching patient:", error);
    return null;
  }
}

// 2. Save Prescription (The Engine)
export async function savePrescription(patientId: string, medicines: any[]) {
  if (!medicines || medicines.length === 0) {
    return { success: false, error: "Prescription cannot be empty." };
  }

  try {
    // A. Save to Database
    await db.insert(prescriptions).values({
      patientId: patientId,   // This links it to the Patient's Dashboard
      medicines: medicines,   // Stores the full list of drugs/dosages as JSON
    });

    // B. Revalidate Paths (Critical for instant updates)
    
    // 1. Update the Doctor's View (so they see it in history immediately)
    revalidatePath(`/doctor/patient/${patientId}`);
    
    // 2. Update the Patient's Dashboard (so the patient sees it on their phone)
    revalidatePath(`/patient/dashboard/${patientId}`);

    // 3. Update the Pharmacy View (Future-proofing)
    // When we build the pharmacy search, this ensures they get the latest data
    revalidatePath(`/pharmacy/search`); 

    return { success: true };

  } catch (error) {
    console.error("Prescription Save Error:", error);
    return { success: false, error: "Database error. Failed to save." };
  }
}