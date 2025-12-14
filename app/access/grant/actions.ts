"use server";

import { db } from "@/db";
import { patients, accessRequests } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache"; // Force fresh data

export async function createAccessRequest(formData: FormData, doctorId: string) {
  const nic = formData.get("nic") as string;

  try {
    // 1. Verify Patient Exists
    const patientList = await db.select().from(patients).where(eq(patients.nic, nic));
    const patient = patientList[0];

    if (!patient) {
      return { success: false, error: "Patient NIC not found. Please register first." };
    }

    // 2. Add to Queue
    await db.insert(accessRequests).values({
      doctorId: doctorId,
      patientId: nic,
      patientName: patient.name,
      status: "pending"
    });

    return { success: true };

  } catch (e) {
    console.error("Queue Error:", e);
    return { success: false, error: "System Error: Could not join queue." };
  }
}

// NEW: Check if the doctor has accepted the patient
export async function checkRequestStatus(nic: string, doctorId: string) {
  noStore(); // Crucial: Never cache this response

  try {
    const requests = await db.select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.patientId, nic),
          eq(accessRequests.doctorId, doctorId)
        )
      )
      .orderBy(desc(accessRequests.createdAt))
      .limit(1);

    if (requests.length === 0) return null;
    
    // Returns "pending", "active", or "completed"
    return { status: requests[0].status }; 

  } catch (error) {
    return null;
  }
}