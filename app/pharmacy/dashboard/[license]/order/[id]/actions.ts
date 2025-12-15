"use server";

import { db } from "@/db";
import { pharmacyQueue, prescriptions, patients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Get Order Details (THE FIX IS IN THE JOIN)
export async function getOrderDetails(orderId: number) {
  try {
    const result = await db.select({
        // Queue Data
        queueId: pharmacyQueue.id,
        patientName: pharmacyQueue.patientName,
        patientNic: pharmacyQueue.patientNic,
        status: pharmacyQueue.status,

        // Prescription Data (Specific to this order)
        prescriptionId: prescriptions.id,
        doctorName: prescriptions.doctorName,
        medicines: prescriptions.medicines,
        createdAt: prescriptions.createdAt,
        prescriptionStatus: prescriptions.status, // 'issued' vs 'dispensed'

        // Patient Data (For Safety Checks)
        age: patients.age,
        allergies: patients.allergies,
      })
      .from(pharmacyQueue)
      // FIX: Join strictly on prescriptionId to avoid fetching old records
      .leftJoin(prescriptions, eq(pharmacyQueue.prescriptionId, prescriptions.id))
      // Join Patient for allergies
      .leftJoin(patients, eq(pharmacyQueue.patientNic, patients.nic))
      .where(eq(pharmacyQueue.id, orderId))
      .limit(1);

    return result[0] || null;

  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

// 2. Process/Dispense Order
export async function processOrder(queueId: number, prescriptionId: number, license: string) {
  try {
    // A. Mark Queue as Completed
    await db.update(pharmacyQueue)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(pharmacyQueue.id, queueId));

    // B. Mark Prescription as Dispensed
    // Only update if it exists (safety check)
    if (prescriptionId) {
        await db.update(prescriptions)
        .set({ status: "dispensed", dispensedAt: new Date() })
        .where(eq(prescriptions.id, prescriptionId));
    }

    revalidatePath(`/pharmacy/dashboard/${license}/queue`);
    return { success: true };
  } catch (error) {
    console.error("Processing error:", error);
    return { success: false, error: "Database update failed." };
  }
}