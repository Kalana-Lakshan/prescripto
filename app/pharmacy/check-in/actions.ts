"use server";

import { db } from "@/db";
import { pharmacies, pharmacyQueue, patients ,prescriptions} from "@/db/schema";
import { eq, and ,ne ,desc} from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Fetch Pharmacy Name
export async function getPharmacyName(license: string) {
  try {
    const res = await db.select({ name: pharmacies.name })
      .from(pharmacies)
      .where(eq(pharmacies.licenseNumber, license))
      .limit(1);
    return res[0] || null;
  } catch (e) {
    return null;
  }
}

export async function getActivePrescriptions(nic: string) {
  try {
    const scripts = await db.select()
      .from(prescriptions)
      .where(and(
        eq(prescriptions.patientId, nic),
        ne(prescriptions.status, "dispensed") // Only fetch ones not bought yet
      ))
      .orderBy(desc(prescriptions.createdAt));

    return scripts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Join Queue Function
export async function joinPharmacyQueue(license: string, nic: string, prescriptionId: number) {
  try {
    // Validate Patient
    const patient = await db.select().from(patients).where(eq(patients.nic, nic)).limit(1);
    if (!patient[0]) return { success: false, error: "Patient NIC not found" };

    // Check Duplicate for THIS specific prescription
    const existing = await db.select().from(pharmacyQueue).where(and(
        eq(pharmacyQueue.pharmacyLicense, license),
        eq(pharmacyQueue.patientNic, nic),
        eq(pharmacyQueue.prescriptionId, prescriptionId), // Check specific ID
        eq(pharmacyQueue.status, "pending")
    )).limit(1);

    if (existing.length > 0) return { success: true, message: "This prescription is already in queue" };

    // Add to Queue
    await db.insert(pharmacyQueue).values({
      pharmacyLicense: license,
      patientNic: nic,
      patientName: patient[0].name,
      prescriptionId: prescriptionId, // Store the ID
      status: "pending"
    });

    revalidatePath(`/pharmacy/dashboard/${license}/queue`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "System Error" };
  }
}

// NEW: Check if the order is ready (Polling function)
export async function checkOrderStatus(license: string, nic: string) {
  try {
    const order = await db.select({ status: pharmacyQueue.status })
      .from(pharmacyQueue)
      .where(and(
        eq(pharmacyQueue.pharmacyLicense, license),
        eq(pharmacyQueue.patientNic, nic)
      ))
      .orderBy(desc(pharmacyQueue.createdAt)) // Get the latest one
      .limit(1);

    if (order.length > 0 && order[0].status === "completed") {
      return { ready: true };
    }
    
    return { ready: false };
  } catch (error) {
    return { ready: false };
  }
}

