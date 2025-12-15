"use server";

import { db } from "@/db";
import { pharmacyQueue, prescriptions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

export async function getPharmacyQueue(license: string) {
  noStore(); // Disable cache for real-time updates

  try {
    // 1. Get Active (Pending) Queue
    const active = await db.select()
      .from(pharmacyQueue)
      .where(and(
         eq(pharmacyQueue.pharmacyLicense, license),
         eq(pharmacyQueue.status, "pending")
      ))
      .orderBy(desc(pharmacyQueue.createdAt));

    // 2. Get Order History (Completed)
    const history = await db.select({
      id: pharmacyQueue.id,
      patientName: pharmacyQueue.patientName,
      patientNic: pharmacyQueue.patientNic,
      status: pharmacyQueue.status,
      updatedAt: pharmacyQueue.updatedAt, // Corrected: ensure this matches your schema (usually camelCase)
      doctorName: prescriptions.doctorName, 
    })
    .from(pharmacyQueue)
    .leftJoin(prescriptions, eq(pharmacyQueue.prescriptionId, prescriptions.id))
    .where(and(
      eq(pharmacyQueue.pharmacyLicense, license),
      eq(pharmacyQueue.status, "completed")
    ))
    .orderBy(desc(pharmacyQueue.updatedAt)); // Corrected: matches the property above

    return { active, history };

  } catch (error) {
    console.error("Error fetching queue:", error);
    // Return empty arrays on error to prevent page crash
    return { active: [], history: [] };
  }
}