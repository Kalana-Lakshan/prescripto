"use server";

import { db } from "@/db";
import { patients, doctors, prescriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Fetch Patient Name (For the Header)
export async function getPatientName(nic: string) {
  try {
    const result = await db.select({ name: patients.name })
      .from(patients)
      .where(eq(patients.nic, nic))
      .limit(1);
      
    return result[0]?.name || nic; // Return Name or fallback to NIC
  } catch (e) {
    console.error("Error fetching patient:", e);
    return nic;
  }
}

// 2. Save Prescription Logic
export async function savePrescription(patientNic: string, medicines: any[], doctorSlmc: string) {
  try {
    // A. Fetch Doctor's Name (To store with the prescription)
    const doctorResult = await db.select({ name: doctors.name })
      .from(doctors)
      .where(eq(doctors.slmcNumber, doctorSlmc))
      .limit(1);

    const doctorName = doctorResult[0]?.name || "Unknown Doctor";

    // B. Insert Prescription
    // Note: We store medicines as a JSON object
    await db.insert(prescriptions).values({
      patientId: patientNic,
      doctorId: doctorSlmc,
      doctorName: doctorName,
      medicines: medicines, 
      status: "pending",
      createdAt: new Date(),
    });

    // C. Revalidate Paths (Refresh data on other pages)
    revalidatePath(`/doctor/patient/${patientNic}`); 
    revalidatePath(`/patient/dashboard/${patientNic}`);
    
    return { success: true };

  } catch (error) {
    console.error("Prescription Error:", error);
    return { success: false, error: "Failed to save prescription." };
  }
}