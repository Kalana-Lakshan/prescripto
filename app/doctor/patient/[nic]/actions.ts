"use server";

import { db } from "@/db";
import { patients, prescriptions, medicalReports, doctors } from "@/db/schema"; 
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

// 1. Fetch Patient Profile & History (UPDATED)
export async function getPatientProfile(nic: string) {
  noStore(); 

  try {
    // 1. Get Personal Info
    const patientData = await db.select()
      .from(patients)
      .where(eq(patients.nic, nic))
      .limit(1);

    if (patientData.length === 0) return null;

    // 2. Get Past Prescriptions with Doctor Specialization (UPDATED JOIN)
    const history = await db.select({
        id: prescriptions.id,
        createdAt: prescriptions.createdAt,
        medicines: prescriptions.medicines,
        doctorName: prescriptions.doctorName,
        // New Field: Fetch Specialization
        doctorSpecialization: doctors.specialization, 
      })
      .from(prescriptions)
      // Join Prescriptions -> Doctors on DoctorID
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.slmcNumber))
      .where(eq(prescriptions.patientId, nic))
      .orderBy(desc(prescriptions.createdAt));

    // 3. Get Medical Reports
    const reports = await db.select()
      .from(medicalReports)
      .where(eq(medicalReports.patientId, nic))
      .orderBy(desc(medicalReports.uploadedAt));

    return {
      patient: patientData[0],
      history: history,
      reports: reports || []
    };

  } catch (error) {
    console.error("Error fetching patient:", error);
    return null;
  }
}

// 2. Save Prescription (Unchanged)
export async function savePrescription(patientId: string, medicines: any[], doctorSlmc: string) {
  if (!medicines || medicines.length === 0) {
    return { success: false, error: "Prescription cannot be empty." };
  }
  if (!doctorSlmc) {
    return { success: false, error: "Doctor identification missing." };
  }

  try {
    // A. Lookup Doctor Name
    const doctorRecord = await db.select()
      .from(doctors)
      .where(eq(doctors.slmcNumber, doctorSlmc))
      .limit(1);

    const doctorName = doctorRecord[0]?.name || "Unknown Doctor";

    // B. Save to Database
    await db.insert(prescriptions).values({
      patientId: patientId,
      doctorId: doctorSlmc,   
      doctorName: doctorName, 
      medicines: medicines,   
    });

    // C. Revalidate Paths
    revalidatePath(`/doctor/patient/${patientId}`);
    revalidatePath(`/patient/dashboard/${patientId}`);
    revalidatePath(`/pharmacy/search`); 

    return { success: true };

  } catch (error) {
    console.error("Prescription Save Error:", error);
    return { success: false, error: "Database error. Failed to save." };
  }
}