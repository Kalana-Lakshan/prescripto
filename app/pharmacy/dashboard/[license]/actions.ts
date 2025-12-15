"use server";

import { db } from "@/db";
// 1. UPDATED IMPORT: Added pharmacyQueue, prescriptions, patients
import { pharmacies, pharmacyQueue, prescriptions, patients, doctors } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

// 1. Get Pharmacy Profile
export async function getPharmacyProfile(license: string) {
  noStore();
  try {
    const result = await db.select()
      .from(pharmacies)
      .where(eq(pharmacies.licenseNumber, license))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching pharmacy profile:", error);
    return null;
  }
}

// 2. Get Waiting Queue (Pending Orders)
export async function getPharmacyQueue(license: string) {
  noStore();
  try {
    return await db.select()
      .from(pharmacyQueue)
      .where(and(
         eq(pharmacyQueue.pharmacyLicense, license),
         eq(pharmacyQueue.status, "pending") // Strict filter
      ))
      .orderBy(desc(pharmacyQueue.createdAt));
  } catch (error) {
    console.error("Error fetching queue:", error);
    return [];
  }
}

// 2. NEW: Get Completed Orders History
export async function getCompletedOrders(license: string) {
  noStore();
  try {
    // Fetch completed queue items joined with Prescription details
    const history = await db.select({
      id: pharmacyQueue.id,
      patientName: pharmacyQueue.patientName,
      patientNic: pharmacyQueue.patientNic,
      completedAt: prescriptions.dispensedAt, // Use the actual dispense time
      doctorName: prescriptions.doctorName,
      medicines: prescriptions.medicines,
    })
    .from(pharmacyQueue)
    .leftJoin(prescriptions, eq(pharmacyQueue.prescriptionId, prescriptions.id))
    .where(and(
      eq(pharmacyQueue.pharmacyLicense, license),
      eq(pharmacyQueue.status, "completed")
    ))
    .orderBy(desc(pharmacyQueue.id)); // Show newest finished orders first

    return history;
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
}

// 3. Get Order Details (Patient Profile + Latest Prescription)
// ... existing imports

export async function getOrderDetails(queueId: number) {
  noStore();
  try {
    // A. Get Queue Item
    const order = await db.select().from(pharmacyQueue).where(eq(pharmacyQueue.id, queueId)).limit(1);
    if (!order[0]) return null;
    
    // B. Get Patient Details
    const patient = await db.select().from(patients).where(eq(patients.nic, order[0].patientNic)).limit(1);

    // C. UPDATED: Get the SPECIFIC Prescription selected by user
    let prescription = null;
    
    if (order[0].prescriptionId) {
        // Fetch by the ID stored in the queue
        const result = await db.select()
          .from(prescriptions)
          .where(eq(prescriptions.id, order[0].prescriptionId))
          .limit(1);
        prescription = result[0];
    } else {
        // Fallback for old data (Latest active)
        const result = await db.select()
          .from(prescriptions)
          .where(eq(prescriptions.patientId, order[0].patientNic))
          .orderBy(desc(prescriptions.createdAt))
          .limit(1);
        prescription = result[0];
    }

    return {
      queueItem: order[0],
      patient: patient[0],
      prescription: prescription || null
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
}
// ... rest of the file
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

// 5. Patient Joins Queue (Called from QR Scan Page)
export async function joinPharmacyQueue(license: string, nic: string) {
  try {
    // A. Validate Patient Exists
    const patient = await db.select().from(patients).where(eq(patients.nic, nic)).limit(1);
    
    if (!patient[0]) {
      return { success: false, error: "Patient NIC not found. Please register first." };
    }

    // B. Check if already in queue (Prevent duplicates)
    const existing = await db.select()
      .from(pharmacyQueue)
      .where(and(
        eq(pharmacyQueue.pharmacyLicense, license),
        eq(pharmacyQueue.patientNic, nic),
        eq(pharmacyQueue.status, "pending")
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, message: "You are already in the queue!" };
    }

    // C. Add to Queue
    await db.insert(pharmacyQueue).values({
      pharmacyLicense: license,
      patientNic: nic,
      patientName: patient[0].name,
      status: "pending"
    });

    // D. Revalidate Pharmacy Dashboard so they see it instantly
    revalidatePath(`/pharmacy/dashboard/${license}/queue`);

    return { success: true };

  } catch (error) {
    console.error("Queue Join Error:", error);
    return { success: false, error: "System error. Try again." };
  }
}