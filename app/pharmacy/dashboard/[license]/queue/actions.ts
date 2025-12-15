"use server";

import { db } from "@/db";
import { pharmacyQueue, prescriptions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

// 1. Get Active (Pending) Queue
export async function getPharmacyQueue(license: string) {
  noStore(); // Disable cache to see real-time updates
  try {
    return await db.select()
      .from(pharmacyQueue)
      .where(and(
         eq(pharmacyQueue.pharmacyLicense, license),
         eq(pharmacyQueue.status, "pending")
      ))
      .orderBy(desc(pharmacyQueue.createdAt));
  } catch (error) {
    console.error("Error fetching queue:", error);
    return [];
  }
}

// 2. Get Order History (Completed)
export async function getCompletedOrders(license: string) {
  noStore();
  try {
    // Join PharmacyQueue with Prescriptions to get details
    const history = await db.select({
      id: pharmacyQueue.id,
      patientName: pharmacyQueue.patientName,
      patientNic: pharmacyQueue.patientNic,
      completedAt: prescriptions.dispensedAt, // Actual dispense time
      doctorName: prescriptions.doctorName,
    })
    .from(pharmacyQueue)
    .leftJoin(prescriptions, eq(pharmacyQueue.prescriptionId, prescriptions.id))
    .where(and(
      eq(pharmacyQueue.pharmacyLicense, license),
      eq(pharmacyQueue.status, "completed")
    ))
    .orderBy(desc(pharmacyQueue.id));

    return history;
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
}