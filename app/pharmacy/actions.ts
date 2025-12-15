"use server";

import { db } from "@/db";
import { pharmacies, pharmacyQueue, prescriptions, patients } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

// 1. Get Pharmacy Profile
export async function getPharmacyProfile(license: string) {
  noStore();
  const data = await db.select().from(pharmacies).where(eq(pharmacies.licenseNumber, license)).limit(1);
  return data[0] || null;
}

// 2. Get Waiting Queue
export async function getPharmacyQueue(license: string) {
  noStore();
  return await db.select()
    .from(pharmacyQueue)
    .where(and(
       eq(pharmacyQueue.pharmacyLicense, license),
       eq(pharmacyQueue.status, "pending")
    ))
    .orderBy(desc(pharmacyQueue.createdAt));
}

// 3. Get Order Details (Patient Profile + Latest Prescription)
export async function getOrderDetails(queueId: number) {
  noStore();
  
  // A. Get Queue Item
  const order = await db.select().from(pharmacyQueue).where(eq(pharmacyQueue.id, queueId)).limit(1);
  if (!order[0]) return null;
  const patientNic = order[0].patientNic;

  // B. Get Patient Details
  const patient = await db.select().from(patients).where(eq(patients.nic, patientNic)).limit(1);

  // C. Get Latest *Issued* Prescription
  const prescription = await db.select()
    .from(prescriptions)
    .where(eq(prescriptions.patientId, patientNic))
    .orderBy(desc(prescriptions.createdAt))
    .limit(1);

  return {
    queueItem: order[0],
    patient: patient[0],
    prescription: prescription[0] || null
  };
}

// 4. Mark Order as Completed (Dispense)
export async function completeOrder(queueId: number, prescriptionId: number) {
  try {
    // A. Mark Queue as Completed
    await db.update(pharmacyQueue)
      .set({ status: "completed" })
      .where(eq(pharmacyQueue.id, queueId));

    // B. Mark Prescription as Dispensed
    if (prescriptionId) {
        await db.update(prescriptions)
          .set({ status: "dispensed", dispensedAt: new Date() })
          .where(eq(prescriptions.id, prescriptionId));
    }

    return { success: true };
  } catch (error) {
    console.error("Dispense Error:", error);
    return { success: false };
  }
}